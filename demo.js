(() => {
  const paths = {
    provenance: "./demo/provenance.json",
    maulFail: "./demo/maul-unrecovered.json",
    maulHold: "./demo/maul-recovered.json",
    holdsFail: "./demo/holds-fail.json",
    holdsHold: "./demo/holds-pass.json",
    holdsCompare: "./demo/holds-compare.json",
    vigilFail: "./demo/vigil-ungoverned.json",
    vigilHold: "./demo/vigil-held.json",
  };

  const loadJson = async (path) => {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`${path} (${response.status})`);
    }
    return response.json();
  };

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  const pct = (value) => `${Math.round(Number(value) * 100)}%`;

  const faultLabel = (fault) => (fault ? String(fault) : "passthrough");

  const renderMeta = (rows) =>
    rows
      .map(
        ([key, value]) =>
          `<div class="tape-kv"><span>${escapeHtml(key)}</span><b>${escapeHtml(value)}</b></div>`,
      )
      .join("");

  const renderMaul = (report, provenance) => {
    const summary = report.summary || {};
    const session = (report.sessions && report.sessions[0]) || {};
    const recovered = session.recovered === true;
    const requests = Array.isArray(report.requests) ? report.requests : [];
    const timeline = requests
      .map((request) => {
        const ok = Number(request.status) < 400;
        return `<li class="${ok ? "ok" : "bad"}">
          <span class="seq">${escapeHtml(request.sequence ?? "·")}</span>
          <span class="status">${escapeHtml(request.status)}</span>
          <span class="fault">${escapeHtml(faultLabel(request.fault_injected))}</span>
          <span class="lat">${escapeHtml(request.latency_ms)}ms</span>
        </li>`;
      })
      .join("");

    return `
      <div class="tape-bar">
        <span class="window-dots"><i></i><i></i><i></i></span>
        <span>maul test · ${escapeHtml(recovered ? "recovered" : "unrecovered")}</span>
        <span class="tape-badge ${recovered ? "hold" : "fail"}">${recovered ? "hold" : "fail"}</span>
      </div>
      <div class="tape-body">
        ${renderMeta([
          ["run_id", report.run_id],
          ["seed", provenance.seed],
          ["scenario", "force_500"],
          ["faults", report.faults_injected],
          ["recovered_sessions", summary.recovered_sessions],
          ["unrecovered_sessions", summary.unrecovered_sessions],
          ["gate", recovered ? "resilience pass" : "resilience fail"],
        ])}
        <p class="tape-session">${escapeHtml(session.session_id || "session")} · recovered=${escapeHtml(session.recovered)}</p>
        <ol class="tape-timeline">${timeline}</ol>
      </div>`;
  };

  const renderHolds = (report, compare, kind) => {
    const summary = report.summary || {};
    const passed = summary.threshold_passed === true;
    const tasks = Array.isArray(report.task_summaries) ? report.task_summaries : [];
    const attempts = Array.isArray(report.attempts) ? report.attempts : [];
    const taskRows = tasks
      .map((task) => {
        const fail = (task.threshold_failures || [])[0];
        return `<li>
          <span class="task">${escapeHtml(task.task_id)}</span>
          <span>${escapeHtml(task.passed)}/${escapeHtml(task.attempts)}</span>
          <span class="${task.threshold_passed ? "ok" : "bad"}">${escapeHtml(pct(task.pass_rate))}</span>
          ${fail ? `<em>${escapeHtml(fail)}</em>` : ""}
        </li>`;
      })
      .join("");
    const attemptRows = attempts
      .map((attempt) => {
        const failedGrader = (attempt.graders || []).find((grader) => !grader.passed);
        return `<li class="${attempt.passed ? "ok" : "bad"}">
          <span class="seq">${escapeHtml(attempt.attempt_id.slice(-3))}</span>
          <span class="status">${attempt.passed ? "pass" : "fail"}</span>
          <span class="fault">${escapeHtml(failedGrader ? failedGrader.message : "all graders")}</span>
        </li>`;
      })
      .join("");
    const compareLine =
      kind === "fail" && compare && Array.isArray(compare.deltas)
        ? compare.deltas
            .filter((delta) => !delta.passed)
            .map((delta) => `<p class="tape-compare">${escapeHtml(delta.message)}</p>`)
            .join("")
        : kind === "hold"
          ? `<p class="tape-compare">candidate ${pct(summary.pass_rate)} matches baseline</p>`
          : "";

    return `
      <div class="tape-bar">
        <span class="window-dots"><i></i><i></i><i></i></span>
        <span>holds ${kind === "fail" ? "compare" : "run"} · refund suite</span>
        <span class="tape-badge ${passed ? "hold" : "fail"}">${passed ? "hold" : "fail"}</span>
      </div>
      <div class="tape-body">
        ${renderMeta([
          ["run_id", report.run_id],
          ["seed", report.seed],
          ["pass_rate", pct(summary.pass_rate)],
          ["schema", pct(summary.schema_valid_rate)],
          ["threshold", passed ? "passed" : "failed"],
        ])}
        <ol class="tape-tasks">${taskRows}</ol>
        <ol class="tape-timeline">${attemptRows}</ol>
        ${compareLine}
      </div>`;
  };

  const renderVigil = (report) => {
    const events = Array.isArray(report.events) ? report.events : [];
    const held = report.kind === "held";
    const last = events[events.length - 1] || {};
    const blocked = events.find((event) => event.action === "block");
    const timeline = events
      .map((event, index) => {
        const blockedEvent = event.action === "block";
        return `<li class="${blockedEvent ? "bad" : "ok"}">
          <span class="seq">${escapeHtml(index + 1)}</span>
          <span class="status">${escapeHtml(event.action)}</span>
          <span class="fault">${escapeHtml(event.reason_code)}</span>
          <span class="lat">${escapeHtml((event.workflow_cost || {}).display || "")}</span>
        </li>`;
      })
      .join("");

    return `
      <div class="tape-bar">
        <span class="window-dots"><i></i><i></i><i></i></span>
        <span>audit.jsonl · ${escapeHtml(held ? "vigil" : "ungoverned")}</span>
        <span class="tape-badge ${held ? "hold" : "fail"}">${held ? "hold" : "open"}</span>
      </div>
      <div class="tape-body">
        ${renderMeta([
          ["workflow", report.workflow_id],
          ["policy", report.policy || "none"],
          ["calls", last.workflow_call_count ?? events.length],
          ["spend", (last.workflow_cost || {}).display || "—"],
          ["decision", blocked ? blocked.reason_code : "none"],
        ])}
        <ol class="tape-timeline">${timeline}</ol>
        <p class="tape-compare">${
          held
            ? "circuit breaker stopped the repeated request"
            : "same fingerprint kept retrying — no governor"
        }</p>
      </div>`;
  };

  const mount = (id, html) => {
    const node = document.getElementById(id);
    if (node) {
      node.innerHTML = html;
    }
  };

  const showError = (id, message) => {
    mount(
      id,
      `<div class="tape-bar"><span>report unavailable</span></div>
       <div class="tape-body"><p class="tape-error">${escapeHtml(message)}</p></div>`,
    );
  };

  const boot = async () => {
    try {
      const [
        provenance,
        maulFail,
        maulHold,
        holdsFail,
        holdsHold,
        holdsCompare,
        vigilFail,
        vigilHold,
      ] = await Promise.all([
        loadJson(paths.provenance),
        loadJson(paths.maulFail),
        loadJson(paths.maulHold),
        loadJson(paths.holdsFail),
        loadJson(paths.holdsHold),
        loadJson(paths.holdsCompare),
        loadJson(paths.vigilFail),
        loadJson(paths.vigilHold),
      ]);

      mount("maul-fail-pane", renderMaul(maulFail, provenance.maul.unrecovered));
      mount("maul-hold-pane", renderMaul(maulHold, provenance.maul.recovered));
      mount("holds-fail-pane", renderHolds(holdsFail, holdsCompare, "fail"));
      mount("holds-hold-pane", renderHolds(holdsHold, holdsCompare, "hold"));
      mount("vigil-fail-pane", renderVigil(vigilFail));
      mount("vigil-hold-pane", renderVigil(vigilHold));
    } catch (error) {
      const message = error instanceof Error ? error.message : "could not load fixtures";
      ["maul-fail-pane", "maul-hold-pane", "holds-fail-pane", "holds-hold-pane", "vigil-fail-pane", "vigil-hold-pane"].forEach(
        (id) => showError(id, message),
      );
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
