// Fills the page from review.json. The agent edits review.json; this file
// stays the same. Text is set with textContent, never as HTML.
(function () {
  "use strict";

  var content = document.getElementById("content");

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined && text !== null && text !== "") {
      node.textContent = String(text);
    }
    return node;
  }

  // Only plain web links and links within this site.
  function safeUrl(url) {
    if (typeof url !== "string" || !url.trim()) {
      return null;
    }
    var value = url.trim();
    if (/^(https?:)?\/\//i.test(value)) {
      return /^https?:\/\//i.test(value) ? value : null;
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
      return null;
    }
    return value;
  }

  function linkFor(variation) {
    return (
      safeUrl(variation.link) ||
      "../?toolbar=" + encodeURIComponent(variation.slug || "")
    );
  }

  function screenshot(src, alt) {
    var url = safeUrl(src);
    if (!url) {
      var empty = el("div", "shot shot--empty", "Screenshot coming");
      empty.setAttribute("role", "img");
      empty.setAttribute("aria-label", "No screenshot yet");
      return empty;
    }
    var img = el("img", "shot");
    img.src = url;
    img.alt = alt;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", function () {
      img.replaceWith(screenshot(null, alt));
    });
    return img;
  }

  function section(title, note) {
    var wrap = el("section", "section");
    wrap.appendChild(el("h2", "section__title", title));
    if (note) {
      wrap.appendChild(el("p", "section__note", note));
    }
    return wrap;
  }

  function placeholder(title, body) {
    var box = el("div", "placeholder");
    box.appendChild(el("strong", "", title));
    var text = el("span");
    body.forEach(function (part) {
      if (part.code) {
        text.appendChild(el("code", "", part.code));
      } else {
        text.appendChild(document.createTextNode(part));
      }
    });
    box.appendChild(text);
    return box;
  }

  function renderPick(data, variations) {
    var pick = variations.filter(function (v) {
      return v.slug && v.slug === data.favorite;
    })[0];
    if (!pick) {
      return null;
    }
    var wrap = section("Our pick");
    var box = el("div", "pick");
    box.appendChild(screenshot(pick.screenshot, pick.name + " toolbar"));
    var body = el("div", "pick__body");
    body.appendChild(el("span", "badge", "Shipped as the default"));
    body.appendChild(el("h3", "pick__name", pick.name || pick.slug));
    if (pick.idea) {
      body.appendChild(el("p", "pick__idea", pick.idea));
    }
    if (pick.why) {
      body.appendChild(el("p", "pick__idea", pick.why));
    }
    var open = el("a", "button button--primary", "Try it");
    open.href = linkFor(pick);
    body.appendChild(open);
    box.appendChild(body);
    wrap.appendChild(box);
    return wrap;
  }

  function renderVideo(video) {
    var wrap = section("Demo video");
    var src = video && safeUrl(video.src);
    if (!src) {
      wrap.appendChild(
        placeholder("No video yet", [
          "A short narrated demo goes here. Save it as ",
          { code: "review/demo.mp4" },
          " and add it to ",
          { code: "review/review.json" },
          ".",
        ]),
      );
      return wrap;
    }
    var player = el("video", "video");
    player.controls = true;
    player.preload = "metadata";
    player.playsInline = true;
    player.src = src;
    var poster = safeUrl(video.poster);
    if (poster) {
      player.poster = poster;
    }
    var captions = safeUrl(video.captions);
    if (captions) {
      var track = el("track");
      track.kind = "captions";
      track.srclang = "en";
      track.label = "English";
      track.src = captions;
      track.default = true;
      player.appendChild(track);
    }
    if (video.title) {
      player.setAttribute("aria-label", video.title);
    }
    wrap.appendChild(player);
    return wrap;
  }

  function renderVariations(data, variations) {
    var wrap = section(
      "All the variations",
      variations.length
        ? "Each one opens the live app with that toolbar. Press [ and ] in the app to flip between them."
        : null,
    );
    var grid = el("div", "grid");
    if (!variations.length) {
      ["Minimal and calm", "Playful and expressive", "Dense for power users", "Big and touch friendly"].forEach(
        function (name) {
          var card = el("article", "card card--empty");
          card.appendChild(screenshot(null, name));
          var body = el("div", "card__body");
          body.appendChild(el("h3", "card__name", name));
          body.appendChild(el("p", "card__idea", "Not built yet."));
          card.appendChild(body);
          grid.appendChild(card);
        },
      );
      wrap.appendChild(grid);
      wrap.appendChild(
        el(
          "p",
          "grid-note",
          "When the variations are built, your agent lists them in review/review.json and they show up here.",
        ),
      );
      return wrap;
    }
    variations.forEach(function (variation) {
      var card = el("article", "card");
      card.appendChild(
        screenshot(variation.screenshot, (variation.name || variation.slug) + " toolbar"),
      );
      var body = el("div", "card__body");
      var head = el("div", "card__head");
      head.appendChild(el("h3", "card__name", variation.name || variation.slug));
      if (variation.slug && variation.slug === data.favorite) {
        head.appendChild(el("span", "badge", "Our pick"));
      }
      body.appendChild(head);
      if (variation.idea) {
        body.appendChild(el("p", "card__idea", variation.idea));
      }
      var link = el("a", "card__link", "Try it live");
      link.href = linkFor(variation);
      body.appendChild(link);
      card.appendChild(body);
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
    return wrap;
  }

  function renderPr(pr) {
    var wrap = section("Pull request");
    var url = pr && safeUrl(pr.url);
    if (!url) {
      wrap.appendChild(
        placeholder("No pull request yet", [
          "Once the favorite is ready, the pull request in your own repo shows up here.",
        ]),
      );
      return wrap;
    }
    var box = el("div", "pr");
    var text = el("div");
    text.appendChild(el("p", "pr__title", pr.title || "Pull request"));
    var meta = [];
    if (pr.number) {
      meta.push("#" + pr.number);
    }
    if (pr.status) {
      meta.push(pr.status);
    }
    if (meta.length) {
      text.appendChild(el("p", "pr__meta", meta.join(" · ")));
    }
    box.appendChild(text);
    var open = el("a", "button", "Open on GitHub");
    open.href = url;
    box.appendChild(open);
    wrap.appendChild(box);
    return wrap;
  }

  function render(data, problem) {
    data = data && typeof data === "object" ? data : {};
    var variations = Array.isArray(data.variations)
      ? data.variations.filter(function (v) {
          return v && typeof v === "object" && (v.slug || v.name);
        })
      : [];

    if (data.title) {
      document.getElementById("title").textContent = data.title;
      document.title = data.title + ": Excalidraw case study";
    }
    if (data.summary) {
      document.getElementById("summary").textContent = data.summary;
    }
    var prUrl = data.pr && safeUrl(data.pr.url);
    if (prUrl) {
      var prButton = el("a", "button", "Pull request");
      prButton.href = prUrl;
      document.getElementById("actions").appendChild(prButton);
    }
    if (data.updated) {
      document.getElementById("updated").textContent = "Updated " + data.updated;
    }

    content.textContent = "";
    if (problem) {
      content.appendChild(el("p", "error", problem));
    }
    var pick = renderPick(data, variations);
    if (pick) {
      content.appendChild(pick);
    }
    content.appendChild(renderVideo(data.video));
    content.appendChild(renderVariations(data, variations));
    content.appendChild(renderPr(data.pr));
  }

  fetch("review.json", { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("review.json returned " + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      render(data);
    })
    .catch(function (error) {
      render({}, "Couldn't read review.json (" + error.message + "). Showing the empty page.");
    });
})();
