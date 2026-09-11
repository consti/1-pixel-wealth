(() => {
  "use strict";
  const snapshot = window.WEALTH_SNAPSHOT;
  const journey = document.getElementById("journey");
  const fortune = document.getElementById("fortune");
  const billion = document.getElementById("billion");
  const dialog = document.getElementById("comparison");
  const jump = document.getElementById("jump");
  const sections = [...document.querySelectorAll("#track > section")];
  const format = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  let person = snapshot.people[0];
  let personalWealth = null;
  const personalInput = document.getElementById("personal-wealth-input");
  const personalError = document.getElementById("personal-wealth-error");
  const precise = new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 3,
  });
  const personalMoney = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const personalStory = {
    id: "personal",
    fraction: 0.001,
    label: "Your wealth",
    title: "Your wealth, in the picture.",
    visual: "personal",
    source: "Your entry · kept only in this tab",
  };
  const contextStories = () =>
    personalWealth === null
      ? window.WEALTH_CONTEXT
      : [personalStory, ...window.WEALTH_CONTEXT];
  let axis = "horizontal";
  let thickness = 500;
  let length = 0;
  let framePending = false;
  let lastLocation;
  const amount = (p) => p.billions * 1e9;
  const short = (p) => `$${format.format(p.billions)} billion`;
  const position = () =>
    axis === "horizontal" ? journey.scrollLeft : journey.scrollTop;
  const offset = (el) => (axis === "horizontal" ? el.offsetLeft : el.offsetTop);
  const extent = (el) =>
    axis === "horizontal" ? el.offsetWidth : el.offsetHeight;

  function scrollToPosition(value) {
    journey.scrollTo({
      left: axis === "horizontal" ? value : 0,
      top: axis === "vertical" ? value : 0,
      behavior: "instant",
    });
    updateProgress();
  }

  // Preserve the section and fraction through it when rotating/resizing, rather
  // than preserving a raw pixel offset (which would represent different wealth).
  function capturePosition() {
    const current = position();
    const section =
      [...sections].reverse().find((el) => offset(el) <= current) ||
      sections[0];
    return {
      section,
      fraction: Math.max(
        0,
        Math.min(1, (current - offset(section)) / extent(section)),
      ),
    };
  }

  function layout(saved) {
    thickness = Math.max(
      100,
      Math.floor(
        Math.min(
          500,
          axis === "horizontal"
            ? journey.clientHeight - 48
            : journey.clientWidth - 52,
        ),
      ),
    );
    length = amount(person) / snapshot.dollarsPerPixel / thickness;
    document.documentElement.style.setProperty("--thickness", `${thickness}px`);
    document.documentElement.style.setProperty(
      "--fortune-length",
      `${length}px`,
    );
    document.documentElement.style.setProperty(
      "--billion-length",
      `${1e9 / snapshot.dollarsPerPixel / thickness}px`,
    );
    fortune.setAttribute(
      "aria-label",
      `${person.name}, ${short(person)}, ${format.format(amount(person) / snapshot.dollarsPerPixel)} square pixels`,
    );
    document.getElementById("ruler-key").textContent =
      `100 scroll pixels = ${money.format(100 * thickness * snapshot.dollarsPerPixel)}`;
    renderMilestones();
    if (saved)
      scrollToPosition(
        offset(saved.section) + saved.fraction * extent(saved.section),
      );
    updateProgress();
  }

  function renderMilestones() {
    const total = amount(person);
    const selectedJump = jump.value;
    const marks = [
      {
        value: 0,
        eyebrow: "The beginning",
        title: `${person.name}’s fortune.`,
        text: `The block is ${thickness.toLocaleString("en-US")} pixels thick. Each pixel you scroll passes ${money.format(thickness * snapshot.dollarsPerPixel)}.`,
      },
      {
        value: total * 0.01,
        eyebrow: "Just 1% of the way",
        title: "Yes, there’s still 99% to go.",
        text: `You’ve passed ${money.format(total * 0.01)}. That is only one hundredth of this fortune.`,
      },
      {
        value: total * 0.5,
        eyebrow: "Halfway",
        title: "Everything so far. Then all of it again.",
        text: `${short({ billions: person.billions / 2 })} behind you. Just as much still ahead.`,
      },
      {
        value: total * 0.9,
        eyebrow: "90% of the way",
        title: "The last tenth is still enormous.",
        text: `${short({ billions: person.billions * 0.1 })} remains.`,
      },
    ];
    snapshot.people
      .filter((p) => amount(p) < total)
      .forEach((p) =>
        marks.push({
          value: amount(p),
          eyebrow: "An entire fortune ends here",
          title: p.name,
          text: `${short(p)}. ${((p.billions / person.billions) * 100).toFixed(1)}% of ${person.name}’s wealth.`,
        }),
      );
    const viewport =
      axis === "horizontal" ? journey.clientWidth : journey.clientHeight;
    const gap = Math.max(viewport, 600) * 1.4;
    const events = marks.map((mark) => ({
      ...mark,
      at: mark.value / snapshot.dollarsPerPixel / thickness,
    }));
    // Give each narrative room to pin without covering an exact wealth marker.
    contextStories().forEach((story) => {
      let at = story.fraction * length;
      let collision;
      while (
        (collision = events.find((event) => Math.abs(event.at - at) < gap))
      )
        at = collision.at + gap;
      events.push({
        story,
        at,
        value: at * snapshot.dollarsPerPixel * thickness,
      });
    });
    events.sort((a, b) => a.at - b.at);
    const container = document.getElementById("milestones");
    container.replaceChildren();
    events.forEach((event, index) => {
      const window = document.createElement("div");
      window.className = "scroll-window";
      window.style.setProperty("--at", `${event.at}px`);
      const available = (events[index + 1]?.at ?? length) - event.at;
      window.style.setProperty(
        "--hold",
        `${Math.max(1, Math.min(14000, available - 40))}px`,
      );
      if (event.story) {
        window.id = `story-${event.story.id}`;
        window.dataset.story = event.story.id;
        window.dataset.position = event.at;
        window.append(renderStory(event.story));
      } else {
        const article = document.createElement("article");
        article.className = "milestone";
        const eyebrow = document.createElement("p");
        eyebrow.className = "eyebrow";
        eyebrow.textContent = event.eyebrow;
        const title = document.createElement("h3");
        title.textContent = event.title;
        const text = document.createElement("p");
        text.textContent = event.text;
        const value = document.createElement("p");
        value.className = "marker-amount";
        value.textContent = money.format(event.value);
        article.append(eyebrow, title, text, value);
        window.append(article);
      }
      container.append(window);
    });
    jump.replaceChildren();
    [
      ["intro", "The first pixel"],
      ["scale", "A million"],
      ["billion", "A billion"],
      ["fortune", "The fortune begins"],
    ].forEach(([value, label]) => jump.add(new Option(label, value)));
    events
      .filter((event) => event.value > 0)
      .forEach((event) => {
        const label = event.story
          ? event.story.label
          : `${event.eyebrow === "An entire fortune ends here" ? event.title : event.eyebrow} · ${format.format(event.value / 1e9)}B`;
        jump.add(
          new Option(
            label,
            event.story ? `story:${event.story.id}` : `money:${event.value}`,
          ),
        );
      });
    jump.add(new Option("The other edge", "end"));
    if ([...jump.options].some((option) => option.value === selectedJump))
      jump.value = selectedJump;
  }

  function renderStory(story) {
    const article = document.createElement("article");
    article.className = "story-card";
    article.tabIndex = 0;
    article.setAttribute("aria-label", story.label);
    const total = amount(person);
    const pct = ((story.value / total) * 100).toFixed(2);
    let visual = "";
    let outcome = "";
    if (story.visual === "personal") {
      const side = Math.sqrt(
        Math.max(0, personalWealth) / snapshot.dollarsPerPixel,
      );
      visual = `<div class="personal-scale-frame" tabindex="0" role="region" aria-label="Your wealth at the same pixel scale; scroll inside to see larger squares"><span class="personal-scale-square" style="width:${side}px;height:${side}px" aria-hidden="true"></span></div><p class="personal-pixel-caption">${personalMoney.format(personalWealth)} · ${precise.format(Math.max(0, personalWealth) / snapshot.dollarsPerPixel)} square pixels</p>`;
      outcome = personalComparison(person);
      const description =
        personalWealth > 0
          ? `One pixel of area still represents $1,000. ${personalWealth < 1000 ? "Your square is smaller than one pixel; the browser may not visibly draw it." : "Large squares can be explored by scrolling inside the frame."}`
          : personalWealth < 0
            ? "Your balance represents net debt, so there is no positive wealth area to draw. A negative balance cannot be shown as a filled money square."
            : "At $0, there is no wealth area to draw. Wealth multiples are undefined for a zero balance.";
      article.innerHTML = `<p class="eyebrow">In perspective · your own wealth</p><h3>${story.title}</h3>${visual}<p class="story-description">${description}</p><p class="story-outcome">${outcome}</p><p class="source-note">${story.source}. <button type="button" class="edit-personal-wealth">Edit or clear your amount</button></p><div class="story-navigation"><span>The fortune behind this card belongs to ${person.name}.</span><button type="button" data-context-next="story:income">Next statistic ${axis === "horizontal" ? "→" : "↓"}</button></div>`;
      return article;
    } else if (story.visual === "square") {
      const side = Math.sqrt(story.value / snapshot.dollarsPerPixel);
      visual = `<div class="context-square-row"><span class="context-square" style="width:${side}px;height:${side}px" aria-label="${money.format(story.value)}, drawn to scale"></span><span>${money.format(story.value)}<small>${format.format(story.value / snapshot.dollarsPerPixel)} square pixels · same scale</small></span></div>`;
      outcome = `${format.format(total / story.value)} ${story.unit} equal ${person.name}’s fortune.`;
    } else if (story.visual === "people") {
      visual = `<div class="people-grid" role="img" aria-label="400 dots, one for each person in the Forbes 400">${"<span></span>".repeat(400)}</div>`;
      outcome = `$6.6 trillion: ${format.format(story.value / total)} times ${person.name}’s selected fortune. Dots count people, not dollars.`;
    } else if (story.visual === "cash") {
      const payments = Math.floor((total * 0.01) / 10000);
      visual = `<div class="cash-count">${format.format(payments)}<small>households receiving $10,000 each</small></div>`;
      outcome = `A 1% allocation is ${money.format(total * 0.01)}. The other 99% is ${short({ billions: person.billions * 0.99 })}.`;
    } else {
      visual = `<div class="share-visual"><span class="share-ring" style="--share:${Math.min(100, Number(pct))}%" aria-hidden="true"></span><span><strong>${pct}%</strong><small>of ${person.name}’s fortune</small></span></div>`;
      outcome =
        story.value > total
          ? `${short({ billions: story.value / 1e9 })} exceeds this fortune by ${short({ billions: (story.value - total) / 1e9 })}. The ring is full at 100%.`
          : `${short({ billions: story.value / 1e9 })} is ${pct}% of this fortune; ${short({ billions: (total - story.value) / 1e9 })} would remain in this arithmetic comparison.`;
      if (story.low)
        outcome += ` The lower estimate is ${((story.low / total) * 100).toFixed(2)}%.`;
    }
    const sources = story.references
      ? story.references.map((id) =>
          window.WEALTH_CONTEXT.find((item) => item.id === id),
        )
      : [story];
    const sourceLinks = sources
      .map(
        (source) =>
          `<a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.source} ↗</a>`,
      )
      .join(" · ");
    const index = contextStories().indexOf(story);
    const next = contextStories()[index + 1];
    article.innerHTML = `<p class="eyebrow">In perspective · ${story.label}</p><h3>${story.title}</h3>${visual}<p class="story-description">${story.description}</p><p class="story-outcome">${outcome}</p><p class="source-note">${sourceLinks}</p><div class="story-navigation"><span>Scroll on. This comparison stays with you.</span><button type="button" data-context-next="${next ? `story:${next.id}` : "end"}">${next ? "Next statistic" : "The other edge"} <span aria-hidden="true">${axis === "horizontal" ? "→" : "↓"}</span></button></div>`;
    return article;
  }

  function personalComparison(p) {
    const fortuneValue = amount(p);
    if (personalWealth <= 0)
      return `${p.name}’s net worth is ${personalMoney.format(fortuneValue - personalWealth)} higher than your balance.`;
    if (personalWealth === fortuneValue)
      return `Your entered wealth equals ${p.name}’s estimated net worth.`;
    if (personalWealth > fortuneValue)
      return `Your entered wealth is about ${format.format(personalWealth / fortuneValue)}× ${p.name}’s fortune.`;
    return `${p.name}’s fortune is about ${format.format(fortuneValue / personalWealth)}× your wealth. You have ${precise.format((personalWealth / fortuneValue) * 100)}% of that fortune.`;
  }

  function renderPersonalSummary() {
    document.getElementById("personal-wealth-result").hidden =
      personalWealth === null;
    document.getElementById("personal-wealth-summary").textContent =
      personalWealth === null
        ? ""
        : `Your net worth: ${personalMoney.format(personalWealth)}. ${personalComparison(person)}`;
  }

  function renderComparison() {
    renderPersonalSummary();
    const list = document.getElementById("comparison-list");
    list.replaceChildren();
    snapshot.people.forEach((p) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "person-option";
      button.dataset.person = p.id;
      button.setAttribute("aria-pressed", String(p.id === person.id));
      const share = ((p.billions / snapshot.people[0].billions) * 100).toFixed(
        1,
      );
      // All content comes from the checked-in snapshot, never external input.
      button.innerHTML = `<span class="person-line"><strong>${p.name}</strong><span>${short(p)} ↗</span></span><span class="person-meta"><span>${p.company}</span><span>${share}% of Musk</span></span><span class="mini-track" aria-hidden="true"><span class="mini-bar" style="--share:${share}%"></span></span>`;
      if (personalWealth !== null) {
        const personal = document.createElement("span");
        personal.className = "personal-person-comparison";
        personal.textContent = personalComparison(p);
        button.append(personal);
      }
      button.addEventListener("click", () => {
        person = p;
        document
          .querySelectorAll("[data-person-name]")
          .forEach((el) => (el.textContent = p.name));
        document
          .querySelectorAll("[data-person-short]")
          .forEach((el) => (el.textContent = short(p)));
        document
          .querySelectorAll("[data-person-possessive]")
          .forEach((el) => (el.textContent = `${p.name}’s`));
        document.querySelector("[data-person-amount]").innerHTML =
          `$${format.format(p.billions)}<span>billion</span>`;
        document.querySelector("[data-billion-multiple]").textContent =
          format.format(p.billions);
        layout();
        renderComparison();
        dialog.close();
        scrollToPosition(offset(fortune));
        jump.value = "fortune";
        journey.focus({ preventScroll: true });
      });
      list.append(button);
    });
  }

  function updateProgress() {
    lastLocation = capturePosition();
    const traversed = Math.max(
      0,
      Math.min(length, position() - offset(fortune)),
    );
    const percent = (traversed / length) * 100;
    document.getElementById("progress-fill").style.width = `${percent}%`;
    const progress = document.querySelector("[role=progressbar]");
    progress.setAttribute("aria-valuenow", percent.toFixed(2));
    progress.setAttribute(
      "aria-valuetext",
      `${percent.toFixed(2)}% of ${person.name}’s fortune`,
    );
    const inFortune = position() >= offset(fortune) - 1;
    document.getElementById("position-label").textContent = inFortune
      ? `${person.name} · ${percent.toFixed(2)}% explored`
      : "One pixel of area = $1,000";
    document.getElementById("position-value").textContent = inFortune
      ? `${money.format(Math.min(amount(person), traversed * thickness * snapshot.dollarsPerPixel))} passed`
      : "A very, very long scroll.";
  }

  function go(target) {
    jump.value = target;
    if (target.startsWith("story:")) {
      const story = document.getElementById(`story-${target.slice(6)}`);
      if (story)
        scrollToPosition(offset(fortune) + Number(story.dataset.position));
    } else if (target.startsWith("money:")) {
      scrollToPosition(
        offset(fortune) +
          Number(target.slice(6)) / snapshot.dollarsPerPixel / thickness,
      );
    } else {
      const el = document.getElementById(target);
      if (el) scrollToPosition(offset(el));
    }
  }

  document
    .getElementById("personal-wealth-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      const raw = personalInput.value.trim().replace(/^\$\s*/, "");
      let cents;
      if (/^-?\$?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(raw)) {
        const normalized = raw.replace(/[$,]/g, "");
        const negative = normalized.startsWith("-");
        const [whole, fraction = ""] = normalized.replace(/^-/, "").split(".");
        cents =
          (BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"))) *
          (negative ? -1n : 1n);
      }
      if (
        cents === undefined ||
        cents > 9000000000000000n ||
        cents < -9000000000000000n
      ) {
        personalError.textContent =
          "Enter a USD amount, such as 100,000 or -5,000, with at most two decimal places (up to $90 trillion).";
        personalInput.setAttribute("aria-invalid", "true");
        personalInput.focus();
        return;
      }
      personalError.textContent = "";
      personalInput.removeAttribute("aria-invalid");
      const saved = capturePosition();
      personalWealth = Number(cents) / 100;
      layout(saved);
      renderComparison();
    });
  document.querySelector('#personal-wealth-form [type="submit"]').disabled =
    false;
  document
    .getElementById("personal-wealth-explore")
    .addEventListener("click", () => {
      dialog.close();
      go("story:personal");
      document
        .querySelector("#story-personal .story-card")
        .focus({ preventScroll: true });
    });
  document
    .getElementById("personal-wealth-clear")
    .addEventListener("click", () => {
      const saved = capturePosition();
      personalWealth = null;
      personalInput.value = "";
      personalError.textContent = "";
      personalInput.removeAttribute("aria-invalid");
      layout(saved);
      renderComparison();
      personalInput.focus();
    });
  personalInput.addEventListener("input", () => {
    personalError.textContent = "";
    personalInput.removeAttribute("aria-invalid");
  });

  document
    .querySelectorAll("[data-go]")
    .forEach((button) =>
      button.addEventListener("click", () => go(button.dataset.go)),
    );
  jump.addEventListener("change", () => go(jump.value));
  document
    .getElementById("statistics-open")
    .addEventListener("click", () => go("story:income"));
  document.getElementById("milestones").addEventListener("click", (event) => {
    if (event.target.closest(".edit-personal-wealth")) {
      dialog.showModal();
      personalInput.focus();
    }
    const next = event.target.closest("[data-context-next]");
    if (next) go(next.dataset.contextNext);
  });
  document.querySelectorAll("button[data-axis]").forEach((button) =>
    button.addEventListener("click", () => {
      if (button.dataset.axis === axis) return;
      const saved = capturePosition();
      axis = button.dataset.axis;
      document.body.dataset.axis = axis;
      document
        .querySelectorAll("button[data-axis]")
        .forEach((el) =>
          el.setAttribute("aria-pressed", String(el.dataset.axis === axis)),
        );
      document
        .querySelectorAll(".direction-arrow")
        .forEach((el) => (el.textContent = axis === "horizontal" ? "→" : "↓"));
      layout(saved);
    }),
  );

  ["compare-open", "compare-end"].forEach((id) =>
    document
      .getElementById(id)
      .addEventListener("click", () => dialog.showModal()),
  );
  document
    .getElementById("compare-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  });

  // Support an ordinary mouse wheel without multiplying native trackpad motion.
  journey.addEventListener(
    "wheel",
    (event) => {
      if (
        axis !== "horizontal" ||
        event.ctrlKey ||
        Math.abs(event.deltaX) >= Math.abs(event.deltaY)
      )
        return;
      const frame = event.target.closest(".personal-scale-frame");
      if (
        frame &&
        (frame.scrollWidth > frame.clientWidth ||
          frame.scrollHeight > frame.clientHeight)
      )
        return;
      const panel = event.target.closest(".panel, .story-card");
      if (
        panel &&
        panel.scrollHeight > panel.clientHeight &&
        ((event.deltaY > 0 &&
          panel.scrollTop < panel.scrollHeight - panel.clientHeight - 1) ||
          (event.deltaY < 0 && panel.scrollTop > 0))
      )
        return;
      event.preventDefault();
      const unit =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? journey.clientWidth
            : 1;
      journey.scrollLeft += event.deltaY * unit;
    },
    { passive: false },
  );
  document.addEventListener("keydown", (event) => {
    if (
      dialog.open ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.target.closest(".personal-scale-frame") ||
      /^(INPUT|SELECT|TEXTAREA|BUTTON|A)$/.test(event.target.tagName)
    )
      return;
    const card = event.target.closest(".story-card");
    if (card && card.scrollHeight > card.clientHeight) {
      const forward =
        ["ArrowDown", "PageDown"].includes(event.key) ||
        (event.key === " " && !event.shiftKey);
      const backward =
        ["ArrowUp", "PageUp"].includes(event.key) ||
        (event.key === " " && event.shiftKey);
      if (
        (forward &&
          card.scrollTop < card.scrollHeight - card.clientHeight - 1) ||
        (backward && card.scrollTop > 0)
      )
        return;
    }
    const step =
      (axis === "horizontal" ? journey.clientWidth : journey.clientHeight) *
      0.85;
    const moves = {
      ArrowRight: 100,
      ArrowDown: 100,
      ArrowLeft: -100,
      ArrowUp: -100,
      PageDown: step,
      PageUp: -step,
      " ": event.shiftKey ? -step : step,
    };
    if (Object.hasOwn(moves, event.key)) {
      event.preventDefault();
      scrollToPosition(position() + moves[event.key]);
    }
    if (event.key === "Home") {
      event.preventDefault();
      go("intro");
    }
    if (event.key === "End") {
      event.preventDefault();
      go("end");
    }
  });
  journey.addEventListener(
    "scroll",
    () => {
      if (!framePending) {
        framePending = true;
        requestAnimationFrame(() => {
          updateProgress();
          framePending = false;
        });
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", () => layout(lastLocation));
  renderComparison();
  layout();
})();
