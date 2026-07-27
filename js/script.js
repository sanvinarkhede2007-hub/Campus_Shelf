(function(){
  "use strict";

  /* ================= THEME ================= */
  var THEME_KEY = "campusShelfTheme";
  var themeToggleBtn = document.getElementById("themeToggleBtn");
  function applyTheme(theme){
    document.documentElement.setAttribute("data-theme", theme);
    themeToggleBtn.innerHTML = theme === "dark" ? "&#9728;&#65039;" : "&#127769;";
    var darkToggle = document.getElementById("darkModeToggle");
    if (darkToggle) darkToggle.checked = (theme === "dark");
    try { localStorage.setItem(THEME_KEY, theme); } catch(e){}
  }
  (function initTheme(){
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch(e){}
    if (!saved) saved = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
    applyTheme(saved);
  })();
  themeToggleBtn.addEventListener("click", function(){
    applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  /* ================= STATE ================= */
  var currentUser = null; // {name, email, department, semester}
  var pendingAction = null;

  var listings = [
    { id:1, title:"Data Structures Textbook", author:"Seymour Lipschutz", department:"Computer Science", course:"CS201", semester:"Semester 3", condition:"Good", type:"sell", price:350, wants:"", contactEmail:"rahul.k@college.edu", contactPhone:"", verified:true, archived:false, previewUrl:null, previewType:null,
      reviews:[{rating:5, text:"Great condition, exactly as described.", author:"Ananya P."},{rating:4, text:"Good book, minor highlighting inside.", author:"Rohit S."}], reports:[] },
    { id:2, title:"Engineering Mathematics Notes (handwritten)", author:"", department:"Mathematics", course:"MA101", semester:"Semester 1", condition:"Fair", type:"free", price:null, wants:"", contactEmail:"priya.s@college.edu", contactPhone:"", verified:true, archived:false, previewUrl:null, previewType:null, reviews:[], reports:[] },
    { id:3, title:"Digital Electronics Lab Manual", author:"", department:"Electronics & Communication", course:"EC205", semester:"Semester 4", condition:"New", type:"swap", price:null, wants:"Signals & Systems textbook", contactEmail:"arjun.m@college.edu", contactPhone:"", verified:false, archived:false, previewUrl:null, previewType:null, reviews:[], reports:[] },
    { id:4, title:"Operating Systems Notes (exam-focused)", author:"", department:"Computer Science", course:"CS301", semester:"Semester 5", condition:"Good", type:"free", price:null, wants:"", contactEmail:"sneha.d@college.edu", contactPhone:"", verified:true, archived:false, previewUrl:null, previewType:null, reviews:[], reports:[] },
    { id:5, title:"Database Management Systems", author:"Korth", department:"Computer Science", course:"CS302", semester:"Semester 5", condition:"Worn", type:"sell", price:200, wants:"", contactEmail:"vikram.p@college.edu", contactPhone:"", verified:true, archived:false, previewUrl:null, previewType:null,
      reviews:[{rating:3, text:"A bit worn but usable.", author:"Divya K."}], reports:[{reason:"Incorrect information", details:"Price listed doesn't match what was agreed."}] },
    { id:6, title:"Thermodynamics Textbook", author:"P.K. Nag", department:"Mechanical Engineering", course:"ME201", semester:"Semester 3", condition:"Good", type:"swap", price:null, wants:"Fluid Mechanics textbook", contactEmail:"aditi.r@college.edu", contactPhone:"", verified:true, archived:false, previewUrl:null, previewType:null, reviews:[], reports:[] },
    { id:7, title:"Computer Networks Reference", author:"Tanenbaum", department:"Computer Science", course:"CS401", semester:"Semester 7", condition:"New", type:"sell", price:500, wants:"", contactEmail:"karan.v@college.edu", contactPhone:"", verified:false, archived:false, previewUrl:null, previewType:null, reviews:[], reports:[] },
    { id:8, title:"Discrete Mathematics Notes", author:"", department:"Mathematics", course:"MA201", semester:"Semester 3", condition:"Fair", type:"free", price:null, wants:"", contactEmail:"meera.n@college.edu", contactPhone:"", verified:true, archived:false, previewUrl:null, previewType:null, reviews:[], reports:[] }
  ];
  var extraByType = {
    sell: { category:"Textbook", highlights:["Well-maintained condition","All pages intact, no missing content","Ideal for exam preparation"], whatsIncluded:["The book itself","Any bundled notes mentioned by the seller"] },
    swap: { category:"Exchange", highlights:["Open to swap with the listed item","Direct handover on campus","Great way to save money"], whatsIncluded:["The book itself"] },
    free: { category:"Free Resource", highlights:["Free of cost — first come, first served","Great for quick revision","Shared by a fellow student"], whatsIncluded:["The notes/book as described"] }
  };
  function applyListingDefaults(l){
    if (!l.status) l.status = "available"; // available | reserved | sold | exchanged
    if (l.reservedBy === undefined) l.reservedBy = null;
    if (l.pickup === undefined) l.pickup = null; // {date, time, location}
    if (l.qr === undefined) l.qr = { buyerScanned:false, sellerScanned:false, code:null };
    if (l.completedAt === undefined) l.completedAt = null;
    // Extended book-detail-page fields
    var extras = extraByType[l.type] || extraByType.sell;
    if (l.subject === undefined) l.subject = l.course;
    if (l.publisher === undefined) l.publisher = ["Pearson Education","McGraw Hill","Prentice Hall","Wiley India","Oxford University Press"][l.id % 5];
    if (l.edition === undefined) l.edition = ["1st Edition","2nd Edition","3rd Edition","4th Edition","5th Edition"][l.id % 5];
    if (l.isbn === undefined) l.isbn = "978-93-" + (100000 + l.id * 137).toString().slice(0,6) + "-" + (l.id % 10);
    if (l.language === undefined) l.language = "English";
    if (l.pages === undefined) l.pages = 220 + (l.id * 37) % 380;
    if (l.category === undefined) l.category = extras.category;
    if (l.originalPrice === undefined) l.originalPrice = l.type === "sell" ? Math.round((l.price || 0) * 1.45 / 5) * 5 : null;
    if (l.description === undefined) {
      l.description = "A " + l.condition.toLowerCase() + "-condition copy of " + l.title + (l.author ? (" by " + l.author) : "") + ", well suited for " + l.department + " students in " + l.semester + ". Carefully kept and ready for a quick campus handover.";
    }
    if (l.highlights === undefined) l.highlights = extras.highlights.slice();
    if (l.whatsIncluded === undefined) l.whatsIncluded = extras.whatsIncluded.slice();
    if (l.deliveryAvailable === undefined) l.deliveryAvailable = (l.id % 3 !== 0);
    if (l.images === undefined) l.images = null; // generated lazily by bookImageSet()
  }
  listings.forEach(applyListingDefaults);
  var nextListingId = 9;
  var activeTypeFilter = "";

  var wishlist = [
    { id:1, title:"Signals and Systems Textbook", department:"Electronics & Communication", course:"EC301", semester:"Semester 5", requestedBy:"Aditi R." },
    { id:2, title:"Fluid Mechanics Textbook", department:"Mechanical Engineering", course:"ME202", semester:"Semester 4", requestedBy:"Karan V." }
  ];
  var nextWishlistId = 3;

  var favorites = [];
  var notifications = [];
  var nextNotifId = 1;
  var recentlyViewed = []; // listing ids, most recent first

  var papers = [
    { id:1, subject:"Data Structures", course:"CS201", year:"2025", department:"Computer Science" },
    { id:2, subject:"Data Structures", course:"CS201", year:"2024", department:"Computer Science" },
    { id:3, subject:"Engineering Mathematics", course:"MA101", year:"2025", department:"Mathematics" },
    { id:4, subject:"Digital Electronics", course:"EC205", year:"2024", department:"Electronics & Communication" },
    { id:5, subject:"Thermodynamics", course:"ME201", year:"2023", department:"Mechanical Engineering" },
    { id:6, subject:"Operating Systems", course:"CS301", year:"2025", department:"Computer Science" }
  ];

  var syllabusList = [
    { id:1, title:"CS201 — Data Structures", department:"Computer Science", fileUrl:null, uploadedBy:"Faculty" },
    { id:2, title:"MA101 — Engineering Mathematics", department:"Mathematics", fileUrl:null, uploadedBy:"Faculty" }
  ];
  var nextSyllabusId = 3;

  var conversations = {};
  var autoReplies = [
    "Thanks for reaching out! Still available — when works for you?",
    "Sure, I can meet near the library after 4pm.",
    "Sounds good, I'll hold it for you until tomorrow."
  ];

  var activeListingId = null;
  var scanStream = null;
  var scanTimer = null;

  /* ================= HELPERS ================= */
  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, function(ch){
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch];
    });
  }
  function initials(name){
    var parts = name.trim().split(/\s+/);
    return ((parts[0] || "?")[0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
  }
  function averageRating(reviews){
    if (!reviews.length) return 0;
    return reviews.reduce(function(a, r){ return a + r.rating; }, 0) / reviews.length;
  }
  function starString(avg){
    var rounded = Math.round(avg);
    return "\u2605".repeat(rounded) + "\u2606".repeat(5 - rounded);
  }
  function isLoggedInAsAdmin(){
    return !!currentUser && currentUser.email.toLowerCase().indexOf("admin") !== -1;
  }
  function requireLogin(action){
    if (currentUser) { action(); return; }
    pendingAction = action;
    openModal(loginBackdrop);
    document.getElementById("l-name").focus();
  }
  function openModal(el){ el.classList.remove("hidden"); }
  function closeModal(el){ el.classList.add("hidden"); }
  function uniqueSorted(arr){ return Array.from(new Set(arr)).sort(); }
  function fillSelect(select, values, placeholder){
    var current = select.value;
    select.innerHTML = '<option value="">' + placeholder + '</option>' +
      values.map(function(v){ return '<option value="' + escapeHtml(v) + '">' + escapeHtml(v) + '</option>'; }).join("");
    if (values.indexOf(current) !== -1) select.value = current;
  }

  function addNotification(text){
    notifications.unshift({ id: nextNotifId++, text: text, read: false });
    updateBellBadge();
  }
  function updateBellBadge(){
    var unread = notifications.filter(function(n){ return !n.read; }).length;
    var badge = document.getElementById("bellBadge");
    badge.textContent = unread;
    badge.classList.toggle("hidden", unread === 0);
  }

  /* ================= NAV / VIEWS ================= */
  var views = {
    browse: document.getElementById("view-browse"),
    wishlist: document.getElementById("view-wishlist"),
    favorites: document.getElementById("view-favorites"),
    semesterlist: document.getElementById("view-semesterlist"),
    papers: document.getElementById("view-papers"),
    syllabus: document.getElementById("view-syllabus"),
    recent: document.getElementById("view-recent"),
    orders: document.getElementById("view-orders"),
    chat: document.getElementById("view-chat"),
    bookdetail: document.getElementById("view-book-detail"),
    profile: document.getElementById("view-profile"),
    dashboard: document.getElementById("view-dashboard"),
    settings: document.getElementById("view-settings"),
    admin: document.getElementById("view-admin")
  };
  var navLinks = document.querySelectorAll(".nav-link");
  var browseFilterBar = document.getElementById("browseFilterBar");

  function showView(name){
    Object.keys(views).forEach(function(key){ views[key].classList.toggle("hidden", key !== name); });
    browseFilterBar.classList.toggle("hidden", name !== "browse");
    navLinks.forEach(function(link){ link.classList.toggle("active", link.getAttribute("data-view") === name); });
    if (name === "wishlist") renderWishlist();
    if (name === "favorites") renderFavorites();
    if (name === "semesterlist") renderSemesterList();
    if (name === "papers") renderPapers();
    if (name === "syllabus") renderSyllabus();
    if (name === "recent") renderRecent();
    if (name === "orders") renderOrders();
    if (name === "chat") { requireLogin(function(){ renderChatSidebar(); }); }
    if (name === "profile") renderProfile();
    if (name === "dashboard") renderDashboard();
    if (name === "settings") renderSettings();
    if (name === "admin") renderAdmin();
  }
  navLinks.forEach(function(link){ link.addEventListener("click", function(){ showView(link.getAttribute("data-view")); }); });
  document.getElementById("brandLink").addEventListener("click", function(e){ e.preventDefault(); showView("browse"); });

  /* ================= NOTIFICATIONS PANEL ================= */
  var bellBtn = document.getElementById("bellBtn");
  var notifPanel = document.getElementById("notifPanel");
  bellBtn.addEventListener("click", function(e){
    e.stopPropagation();
    var opening = notifPanel.classList.contains("hidden");
    notifPanel.classList.toggle("hidden");
    if (opening) {
      notifPanel.innerHTML = notifications.length
        ? notifications.map(function(n){ return '<div class="notif-item">' + escapeHtml(n.text) + '</div>'; }).join("")
        : '<div class="notif-empty">No notifications yet.</div>';
      notifications.forEach(function(n){ n.read = true; });
      updateBellBadge();
    }
  });
  document.addEventListener("click", function(e){
    if (!notifPanel.classList.contains("hidden") && !notifPanel.contains(e.target) && e.target !== bellBtn) {
      notifPanel.classList.add("hidden");
    }
  });

  /* ================= LOGIN ================= */
  var loginBackdrop = document.getElementById("loginBackdrop");
  var loginForm = document.getElementById("loginForm");

  document.getElementById("loginNavBtn").addEventListener("click", function(){ openModal(loginBackdrop); });
  document.getElementById("closeLoginModal").addEventListener("click", function(){ pendingAction = null; closeModal(loginBackdrop); });
  document.getElementById("cancelLoginModal").addEventListener("click", function(){ pendingAction = null; closeModal(loginBackdrop); });
  loginBackdrop.addEventListener("click", function(e){ if (e.target === loginBackdrop) { pendingAction = null; closeModal(loginBackdrop); } });

  loginForm.addEventListener("submit", function(e){
    e.preventDefault();
    var name = document.getElementById("l-name").value.trim();
    var email = document.getElementById("l-email").value.trim();
    var password = document.getElementById("l-password").value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert("Enter a valid email address."); return; }
    if (password && password.length < 4) { alert("Password must be at least 4 characters."); return; }
    currentUser = {
      name: name,
      email: email,
      department: document.getElementById("l-department").value,
      semester: document.getElementById("l-semester").value,
      joinedDate: new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    };
    updateAuthUI();
    loginForm.reset();
    closeModal(loginBackdrop);
    renderBrowse();
    var action = pendingAction; pendingAction = null;
    if (action) action();
  });

  document.getElementById("logoutBtn").addEventListener("click", function(){
    currentUser = null;
    closeUserDropdown();
    updateAuthUI();
    renderBrowse();
    showView("browse");
  });

  function updateAuthUI(){
    var loggedOut = document.getElementById("loggedOutControls");
    var loggedIn = document.getElementById("loggedInControls");
    var adminLink = document.getElementById("adminNavLink");
    if (currentUser) {
      loggedOut.classList.add("hidden");
      loggedIn.classList.remove("hidden");
      updateAllAvatars();
      document.getElementById("userNameLabel").textContent = currentUser.name;
      document.getElementById("userEmailLabel").textContent = currentUser.email;
      adminLink.classList.toggle("hidden", !isLoggedInAsAdmin());
    } else {
      loggedOut.classList.remove("hidden");
      loggedIn.classList.add("hidden");
      adminLink.classList.add("hidden");
      closeUserDropdown();
    }
  }

  /* ================= USER ACCOUNT DROPDOWN ================= */
  var userAvatarBtn = document.getElementById("userAvatar");
  var userDropdown = document.getElementById("userDropdown");

  function closeUserDropdown(){
    userDropdown.classList.add("hidden");
    userAvatarBtn.setAttribute("aria-expanded", "false");
  }
  userAvatarBtn.addEventListener("click", function(e){
    e.stopPropagation();
    var opening = userDropdown.classList.contains("hidden");
    userDropdown.classList.toggle("hidden");
    userAvatarBtn.setAttribute("aria-expanded", opening ? "true" : "false");
  });
  document.addEventListener("click", function(e){
    if (!userDropdown.classList.contains("hidden") && !userDropdown.contains(e.target) && e.target !== userAvatarBtn) {
      closeUserDropdown();
    }
  });
  document.querySelectorAll("#userDropdown .user-dropdown-item[data-view]").forEach(function(item){
    item.addEventListener("click", function(){
      closeUserDropdown();
      showView(item.getAttribute("data-view"));
    });
  });

  /* ================= PROFILE PICTURE ================= */
  function avatarMarkup(){
    if (currentUser && currentUser.avatarUrl) return '<img src="' + currentUser.avatarUrl + '" alt="">';
    return currentUser ? initials(currentUser.name) : "?";
  }
  function updateAllAvatars(){
    var mk = avatarMarkup();
    document.getElementById("userAvatar").innerHTML = mk;
    document.getElementById("userAvatarLarge").innerHTML = mk;
    var big = document.getElementById("profileAvatarLarge");
    if (big) big.innerHTML = mk;
  }
  var avatarFileInput = document.getElementById("avatarFileInput");
  document.getElementById("changePhotoBtn").addEventListener("click", function(){ avatarFileInput.click(); });
  avatarFileInput.addEventListener("change", function(){
    var file = avatarFileInput.files[0];
    if (!file || !currentUser) return;
    var reader = new FileReader();
    reader.onload = function(e){
      currentUser.avatarUrl = e.target.result;
      updateAllAvatars();
      document.getElementById("removePhotoBtn").classList.remove("hidden");
    };
    reader.readAsDataURL(file);
    avatarFileInput.value = "";
  });
  document.getElementById("removePhotoBtn").addEventListener("click", function(){
    if (!currentUser) return;
    delete currentUser.avatarUrl;
    updateAllAvatars();
    document.getElementById("removePhotoBtn").classList.add("hidden");
  });

  /* ================= FILTERS / BROWSE ================= */
  var grid = document.getElementById("listingsGrid");
  var emptyState = document.getElementById("emptyState");
  var searchInput = document.getElementById("searchInput");
  var departmentFilter = document.getElementById("departmentFilter");
  var courseFilter = document.getElementById("courseFilter");
  var semesterFilter = document.getElementById("semesterFilter");
  var verifiedOnly = document.getElementById("verifiedOnly");
  var resultCount = document.getElementById("resultCount");
  var chips = document.querySelectorAll(".chip");

  function rebuildFilterOptions(){
    var active = listings.filter(function(l){ return !l.archived; });
    fillSelect(departmentFilter, uniqueSorted(active.map(function(l){ return l.department; })), "All departments");
    fillSelect(courseFilter, uniqueSorted(active.map(function(l){ return l.course; })), "All courses");
    fillSelect(semesterFilter, uniqueSorted(active.map(function(l){ return l.semester; }))
      .sort(function(a,b){ return parseInt(a.replace(/\D/g,""),10) - parseInt(b.replace(/\D/g,""),10); }), "All semesters");
  }

  function currentFilters(){
    return {
      query: searchInput.value.trim().toLowerCase(),
      department: departmentFilter.value,
      course: courseFilter.value,
      semester: semesterFilter.value,
      type: activeTypeFilter,
      verifiedOnly: verifiedOnly.checked
    };
  }
  function matches(listing, f){
    if (listing.archived) return false;
    if (f.type && listing.type !== f.type) return false;
    if (f.department && listing.department !== f.department) return false;
    if (f.course && listing.course !== f.course) return false;
    if (f.semester && listing.semester !== f.semester) return false;
    if (f.verifiedOnly && !listing.verified) return false;
    if (f.query){
      var haystack = (listing.title + " " + listing.author).toLowerCase();
      if (haystack.indexOf(f.query) === -1) return false;
    }
    return true;
  }

  function thumbHtml(listing){
    var badge = listing.verified ? '<span class="verified-badge">&#10003; Verified</span>' : '<span class="pending-badge">Pending</span>';
    var typeBadge = '<span class="type-badge ' + listing.type + '">' + listing.type.toUpperCase() + '</span>';
    if (listing.previewUrl && listing.previewType === "image") {
      return '<div class="card-thumb">' + badge + typeBadge + '<img src="' + listing.previewUrl + '" alt=""></div>';
    }
    return '<div class="card-thumb">' + badge + typeBadge + '<span>No preview</span></div>';
  }

  var coverPalettes = [
    ["#4F46E5","#7C3AED"], ["#0EA5E9","#6366F1"], ["#059669","#0D9488"],
    ["#DB2777","#9333EA"], ["#D97706","#DC2626"], ["#2563EB","#4338CA"]
  ];
  function bookCoverSvg(listing, label){
    var pal = coverPalettes[listing.id % coverPalettes.length];
    var titleLines = listing.title.match(/.{1,18}(\s|$)/g) || [listing.title];
    titleLines = titleLines.slice(0, 4).map(function(s){ return s.trim(); });
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">' +
      '<defs><linearGradient id="g' + listing.id + label + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="' + pal[0] + '"/><stop offset="100%" stop-color="' + pal[1] + '"/></linearGradient></defs>' +
      '<rect width="300" height="400" rx="10" fill="url(#g' + listing.id + label + ')"/>' +
      '<rect x="14" y="14" width="272" height="372" rx="6" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>' +
      '<text x="30" y="60" fill="rgba(255,255,255,0.85)" font-family="Georgia, serif" font-size="13" letter-spacing="2">' + escapeHtml((listing.category || "BOOK").toUpperCase()) + '</text>' +
      titleLines.map(function(line, i){
        return '<text x="30" y="' + (150 + i * 30) + '" fill="#ffffff" font-family="Georgia, serif" font-size="22" font-weight="700">' + escapeHtml(line) + '</text>';
      }).join("") +
      (listing.author ? '<text x="30" y="' + (150 + titleLines.length * 30 + 26) + '" fill="rgba(255,255,255,0.85)" font-family="Inter, sans-serif" font-size="14">' + escapeHtml(listing.author) + '</text>' : "") +
      '<text x="30" y="372" fill="rgba(255,255,255,0.65)" font-family="Inter, sans-serif" font-size="12">' + escapeHtml(label) + '</text>' +
      '</svg>';
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }
  function bookImageSet(listing){
    if (listing.images) return listing.images;
    var labels = ["Front Cover", "Back Cover", "Spine View", "Inside Pages"];
    listing.images = labels.map(function(lbl){ return { url: bookCoverSvg(listing, lbl), label: lbl }; });
    return listing.images;
  }

  function cardHtml(listing){
    var avg = averageRating(listing.reviews);
    var priceLine = "";
    if (listing.type === "sell") {
      priceLine = '<p class="price-line">&#8377;' + escapeHtml(listing.price != null ? listing.price : "?") + '</p>';
    } else if (listing.type === "swap") {
      priceLine = '<p class="detail-line">Wants: ' + escapeHtml(listing.wants || "open to offers") + '</p>';
    } else {
      priceLine = '<p class="price-line free-color">Free</p>';
    }
    var ratingLine = listing.reviews.length
      ? '<p class="rating-line"><span class="stars">' + starString(avg) + '</span>' + avg.toFixed(1) + ' (' + listing.reviews.length + ')</p>'
      : '<p class="rating-line">No reviews yet</p>';
    var isFav = favorites.indexOf(listing.id) !== -1;
    var statusLabels = { available:"Available", reserved:"Reserved", sold:"Sold", exchanged:"Exchanged" };
    var statusRow = '<div class="status-row"><span class="status-badge status-' + listing.status + '">' + statusLabels[listing.status] + '</span>' +
      (listing.reservedBy ? '<span class="meta-line" style="margin:0;">held for ' + escapeHtml(listing.reservedBy) + '</span>' : '') + '</div>';
    var pickupInfo = listing.pickup
      ? '<p class="pickup-info">Pickup: ' + escapeHtml(listing.pickup.date) + ' at ' + escapeHtml(listing.pickup.time) + ' &middot; ' + escapeHtml(listing.pickup.location) + '</p>'
      : "";

    var exchangeActions = "";
    if (listing.status === "available") {
      exchangeActions = '<button class="btn btn-outline btn-small reserve-btn" data-id="' + listing.id + '">Reserve</button>';
    } else if (listing.status === "reserved") {
      exchangeActions =
        '<button class="btn btn-outline btn-small pickup-btn" data-id="' + listing.id + '">' + (listing.pickup ? "Reschedule pickup" : "Schedule pickup") + '</button>' +
        '<button class="btn btn-outline btn-small qr-btn" data-id="' + listing.id + '">Confirm with QR</button>';
    }

    return (
      '<article class="card" data-id="' + listing.id + '">' +
        thumbHtml(listing) +
        '<div class="card-body">' +
          '<div class="card-title-row"><h3>' + escapeHtml(listing.title) + '</h3>' +
            '<button class="fav-btn' + (isFav ? ' active' : '') + '" data-id="' + listing.id + '" aria-label="Save to favorites">' + (isFav ? '\u2665' : '\u2661') + '</button>' +
          '</div>' +
          '<p class="author">' + (listing.author ? escapeHtml(listing.author) : "&nbsp;") + '</p>' +
          '<p class="meta-line">' + escapeHtml(listing.department) + ' &middot; ' + escapeHtml(listing.course) + ' &middot; ' + escapeHtml(listing.semester) + ' &middot; ' + escapeHtml(listing.condition) + '</p>' +
          ratingLine +
          priceLine +
          statusRow +
          pickupInfo +
          '<div class="card-actions">' +
            '<button class="btn btn-outline btn-small preview-btn" data-id="' + listing.id + '">Preview</button>' +
            '<button class="btn btn-outline btn-small chat-btn" data-id="' + listing.id + '">Chat</button>' +
            '<button class="btn btn-outline btn-small review-btn" data-id="' + listing.id + '">Reviews</button>' +
            exchangeActions +
          '</div>' +
          '<div class="card-footer-row"><button class="btn-link report-btn" data-id="' + listing.id + '">Report this listing</button></div>' +
        '</div>' +
      '</article>'
    );
  }

  var suggestedStrip = document.getElementById("suggestedStrip");
  var suggestedSub = document.getElementById("suggestedSub");
  function renderSuggested(){
    var active = listings.filter(function(l){ return !l.archived && l.status === "available"; });
    var pool;
    if (currentUser && currentUser.department && currentUser.semester) {
      var mine = active.filter(function(l){ return l.department === currentUser.department && l.semester === currentUser.semester; });
      var rest = active.filter(function(l){ return mine.indexOf(l) === -1; });
      pool = mine.concat(rest);
      suggestedSub.textContent = "Picked for " + currentUser.department + ", " + currentUser.semester + " — plus top picks from campus.";
    } else {
      pool = active.slice();
      suggestedSub.textContent = "Top-rated and freshly listed picks from across campus.";
    }
    pool = pool.slice().sort(function(a, b){
      var scoreA = (a.verified ? 2 : 0) + averageRating(a.reviews);
      var scoreB = (b.verified ? 2 : 0) + averageRating(b.reviews);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return b.id - a.id;
    }).slice(0, 8);
    suggestedStrip.innerHTML = pool.map(cardHtml).join("");
    document.getElementById("suggestedSection").classList.toggle("hidden", pool.length === 0);
    bindCardButtons(suggestedStrip);
  }

  function renderBrowse(){
    var f = currentFilters();
    var visible = listings.filter(function(l){ return matches(l, f); });
    grid.innerHTML = visible.map(cardHtml).join("");
    emptyState.classList.toggle("hidden", visible.length !== 0);
    resultCount.textContent = visible.length + " of " + listings.filter(function(l){ return !l.archived; }).length + " shown";

    var active = listings.filter(function(l){ return !l.archived; });
    document.getElementById("statListings").textContent = active.length;
    document.getElementById("statVerified").textContent = active.filter(function(l){ return l.verified; }).length;
    document.getElementById("statWishlist").textContent = wishlist.length;

    bindCardButtons(grid);
    renderSuggested();
  }
  function bindCardButtons(container){
    Array.prototype.forEach.call(container.querySelectorAll(".card"), function(card){
      card.addEventListener("click", function(e){
        if (e.target.closest("button, a, input, .card-actions, .card-footer-row")) return;
        openBookDetail(parseInt(card.dataset.id, 10));
      });
    });
    Array.prototype.forEach.call(container.querySelectorAll(".preview-btn"), function(btn){
      btn.addEventListener("click", function(){
        var id = parseInt(btn.dataset.id,10);
        trackRecentlyViewed(id);
        openPreview(id);
      });
    });
    Array.prototype.forEach.call(container.querySelectorAll(".chat-btn"), function(btn){
      btn.addEventListener("click", function(){ var id = parseInt(btn.dataset.id,10); trackRecentlyViewed(id); requireLogin(function(){ openChatForListing(id); }); });
    });
    Array.prototype.forEach.call(container.querySelectorAll(".review-btn"), function(btn){
      btn.addEventListener("click", function(){ openReview(parseInt(btn.dataset.id,10)); });
    });
    Array.prototype.forEach.call(container.querySelectorAll(".report-btn"), function(btn){
      btn.addEventListener("click", function(){ requireLogin(function(){ openReport(parseInt(btn.dataset.id,10)); }); });
    });
    Array.prototype.forEach.call(container.querySelectorAll(".fav-btn"), function(btn){
      btn.addEventListener("click", function(){ requireLogin(function(){ toggleFavorite(parseInt(btn.dataset.id,10)); }); });
    });
    Array.prototype.forEach.call(container.querySelectorAll(".reserve-btn"), function(btn){
      btn.addEventListener("click", function(){ requireLogin(function(){ reserveListing(parseInt(btn.dataset.id,10)); }); });
    });
    Array.prototype.forEach.call(container.querySelectorAll(".pickup-btn"), function(btn){
      btn.addEventListener("click", function(){ requireLogin(function(){ openPickup(parseInt(btn.dataset.id,10)); }); });
    });
    Array.prototype.forEach.call(container.querySelectorAll(".qr-btn"), function(btn){
      btn.addEventListener("click", function(){ requireLogin(function(){ openQr(parseInt(btn.dataset.id,10)); }); });
    });
  }

  function trackRecentlyViewed(id){
    recentlyViewed = recentlyViewed.filter(function(x){ return x !== id; });
    recentlyViewed.unshift(id);
    if (recentlyViewed.length > 12) recentlyViewed.length = 12;
  }

  function reserveListing(id){
    var listing = listings.find(function(l){ return l.id === id; });
    if (!listing || listing.status !== "available") return;
    listing.status = "reserved";
    listing.reservedBy = currentUser.name;
    addNotification('You reserved "' + listing.title + '". Schedule a campus pickup when ready.');
    renderBrowse();
    if (!views.favorites.classList.contains("hidden")) renderFavorites();
    if (!views.semesterlist.classList.contains("hidden")) renderSemesterList();
    if (!views.recent.classList.contains("hidden")) renderRecent();
  }

  function toggleFavorite(id){
    var idx = favorites.indexOf(id);
    if (idx === -1) favorites.push(id); else favorites.splice(idx, 1);
    renderBrowse();
    if (!views.favorites.classList.contains("hidden")) renderFavorites();
  }

  searchInput.addEventListener("input", renderBrowse);
  departmentFilter.addEventListener("change", renderBrowse);
  courseFilter.addEventListener("change", renderBrowse);
  semesterFilter.addEventListener("change", renderBrowse);
  verifiedOnly.addEventListener("change", renderBrowse);
  Array.prototype.forEach.call(chips, function(chip){
    chip.addEventListener("click", function(){
      Array.prototype.forEach.call(chips, function(c){ c.setAttribute("aria-pressed","false"); });
      chip.setAttribute("aria-pressed","true");
      activeTypeFilter = chip.getAttribute("data-type");
      renderBrowse();
    });
  });

  /* ================= FAVORITES VIEW ================= */
  var favoritesGrid = document.getElementById("favoritesGrid");
  var favoritesEmpty = document.getElementById("favoritesEmpty");
  function renderFavorites(){
    var favListings = listings.filter(function(l){ return !l.archived && favorites.indexOf(l.id) !== -1; });
    favoritesGrid.innerHTML = favListings.map(cardHtml).join("");
    favoritesEmpty.classList.toggle("hidden", favListings.length !== 0);
    bindCardButtons(favoritesGrid);
  }

  /* ================= POST LISTING ================= */
  var postBackdrop = document.getElementById("postModalBackdrop");
  var postForm = document.getElementById("postForm");
  var typeSelect = document.getElementById("f-type");
  var priceField = document.getElementById("priceField");
  var wantsField = document.getElementById("wantsField");
  var fileInput = document.getElementById("f-file");
  var fileHint = document.getElementById("fileHint");
  var courseInput = document.getElementById("f-course");
  var departmentSelect = document.getElementById("f-department");
  var priceInput = document.getElementById("f-price");
  var priceSuggestionHint = document.getElementById("priceSuggestionHint");
  var pendingUpload = null;

  document.getElementById("postNavBtn").addEventListener("click", function(){
    requireLogin(function(){ openModal(postBackdrop); document.getElementById("f-title").focus(); });
  });
  document.getElementById("closePostModal").addEventListener("click", closePostModal);
  document.getElementById("cancelPostModal").addEventListener("click", closePostModal);
  postBackdrop.addEventListener("click", function(e){ if (e.target === postBackdrop) closePostModal(); });

  function closePostModal(){
    closeModal(postBackdrop);
    postForm.reset();
    pendingUpload = null;
    fileHint.textContent = "Optional, but listings with a preview get more responses.";
    priceSuggestionHint.textContent = "";
    updateConditionalFields();
  }
  function updateConditionalFields(){
    var type = typeSelect.value;
    priceField.classList.toggle("hidden", type !== "sell");
    wantsField.classList.toggle("hidden", type !== "swap");
    updatePriceSuggestion();
  }
  typeSelect.addEventListener("change", updateConditionalFields);

  function updatePriceSuggestion(){
    if (typeSelect.value !== "sell") { priceSuggestionHint.textContent = ""; return; }
    var course = courseInput.value.trim().toUpperCase();
    var department = departmentSelect.value;
    var similar = listings.filter(function(l){
      return !l.archived && l.type === "sell" && l.price != null && (l.course === course || l.department === department);
    });
    if (!similar.length) { priceSuggestionHint.textContent = ""; return; }
    var avg = Math.round(similar.reduce(function(a,l){ return a + l.price; }, 0) / similar.length);
    priceSuggestionHint.textContent = "Similar listings average \u20B9" + avg + ".";
    if (!priceInput.value) priceInput.placeholder = "e.g. " + avg;
  }
  courseInput.addEventListener("input", updatePriceSuggestion);
  departmentSelect.addEventListener("change", updatePriceSuggestion);

  fileInput.addEventListener("change", function(){
    var file = fileInput.files[0];
    if (!file) { pendingUpload = null; return; }
    if (file.type.indexOf("image/") === 0) {
      pendingUpload = { url: URL.createObjectURL(file), type: "image" };
      fileHint.textContent = "Selected: " + file.name;
    } else if (file.type === "application/pdf") {
      pendingUpload = { url: URL.createObjectURL(file), type: "pdf" };
      fileHint.textContent = "Selected: " + file.name;
    } else {
      pendingUpload = null;
      fileHint.textContent = "Please choose an image or PDF file.";
    }
  });

  /* ---- ISBN lookup ---- */
  var isbnInput = document.getElementById("f-isbn");
  var isbnHint = document.getElementById("isbnHint");

  function lookupIsbn(isbn){
    isbn = isbn.replace(/[^0-9Xx]/g, "");
    if (!isbn) { isbnHint.textContent = "Enter an ISBN first."; return; }
    isbnHint.textContent = "Looking up\u2026";
    fetch("https://openlibrary.org/api/books?bibkeys=ISBN:" + encodeURIComponent(isbn) + "&format=json&jscmd=data")
      .then(function(r){ return r.json(); })
      .then(function(data){
        var book = data["ISBN:" + isbn];
        if (!book) { isbnHint.textContent = "No book found for that ISBN — enter details manually."; return; }
        document.getElementById("f-title").value = book.title || "";
        document.getElementById("f-author").value = (book.authors && book.authors[0] && book.authors[0].name) || "";
        isbnHint.textContent = "Filled in from Open Library.";
      })
      .catch(function(){ isbnHint.textContent = "Lookup failed — check your connection, or enter details manually."; });
  }
  document.getElementById("isbnLookupBtn").addEventListener("click", function(){ lookupIsbn(isbnInput.value); });
  isbnInput.addEventListener("keydown", function(e){ if (e.key === "Enter") { e.preventDefault(); lookupIsbn(isbnInput.value); } });

  /* ---- Barcode scan ---- */
  var scanBackdrop = document.getElementById("scanBackdrop");
  var scanVideo = document.getElementById("scanVideo");
  var scanHint = document.getElementById("scanHint");

  document.getElementById("isbnScanBtn").addEventListener("click", function(){
    if (!("BarcodeDetector" in window)) {
      isbnHint.textContent = "Barcode scanning isn't supported in this browser — enter the ISBN manually above.";
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      isbnHint.textContent = "Camera access isn't available here — enter the ISBN manually above.";
      return;
    }
    openModal(scanBackdrop);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(function(stream){
        scanStream = stream;
        scanVideo.srcObject = stream;
        var detector = new window.BarcodeDetector({ formats: ["ean_13"] });
        scanTimer = setInterval(function(){
          detector.detect(scanVideo).then(function(codes){
            if (codes && codes.length) {
              isbnInput.value = codes[0].rawValue;
              stopScan();
              lookupIsbn(codes[0].rawValue);
            }
          }).catch(function(){ /* detection frame failed, try next tick */ });
        }, 500);
      })
      .catch(function(){
        scanHint.textContent = "Couldn't access the camera — check permissions, or enter the ISBN manually.";
      });
  });
  function stopScan(){
    if (scanTimer) { clearInterval(scanTimer); scanTimer = null; }
    if (scanStream) { scanStream.getTracks().forEach(function(t){ t.stop(); }); scanStream = null; }
    closeModal(scanBackdrop);
  }
  document.getElementById("closeScanModal").addEventListener("click", stopScan);
  scanBackdrop.addEventListener("click", function(e){ if (e.target === scanBackdrop) stopScan(); });

  postForm.addEventListener("submit", function(e){
    e.preventDefault();
    var type = typeSelect.value;
    var priceRaw = priceInput.value;
    var contactEmail = document.getElementById("f-contact-email").value.trim();
    var contactPhone = document.getElementById("f-contact-phone").value.trim();
    if (!contactEmail && !contactPhone) {
      alert("Please provide at least an email or a phone number so buyers can reach you.");
      return;
    }

    listings.unshift({
      id: nextListingId++,
      title: document.getElementById("f-title").value.trim(),
      author: document.getElementById("f-author").value.trim(),
      department: departmentSelect.value,
      course: courseInput.value.trim().toUpperCase(),
      semester: document.getElementById("f-semester").value,
      condition: document.getElementById("f-condition").value,
      type: type,
      price: type === "sell" && priceRaw ? parseInt(priceRaw,10) : null,
      wants: type === "swap" ? document.getElementById("f-wants").value.trim() : "",
      contactEmail: contactEmail,
      contactPhone: contactPhone,
      verified: false,
      archived: false,
      previewUrl: pendingUpload ? pendingUpload.url : null,
      previewType: pendingUpload ? pendingUpload.type : null,
      reviews: [],
      reports: [],
      status: "available",
      reservedBy: null,
      pickup: null,
      qr: { buyerScanned:false, sellerScanned:false, code:null },
      completedAt: null
    });
    applyListingDefaults(listings[0]);


    wishlist.forEach(function(item){
      if (isNowAvailable(item)) addNotification('Your wishlist item "' + item.title + '" is now available!');
    });

    rebuildFilterOptions();
    renderBrowse();
    closePostModal();
  });

  /* ================= PREVIEW ================= */
  var previewBackdrop = document.getElementById("previewBackdrop");
  var previewBody = document.getElementById("previewBody");
  var previewTitle = document.getElementById("previewTitle");

  function openPreview(id){
    var listing = listings.find(function(l){ return l.id === id; });
    if (!listing) return;
    previewTitle.textContent = "Preview — " + listing.title;
    if (listing.previewUrl && listing.previewType === "image") {
      previewBody.innerHTML = '<img src="' + listing.previewUrl + '" alt="Preview of ' + escapeHtml(listing.title) + '">';
    } else if (listing.previewUrl && listing.previewType === "pdf") {
      previewBody.innerHTML = '<embed src="' + listing.previewUrl + '" type="application/pdf">';
    } else {
      previewBody.innerHTML = '<div class="preview-empty">No preview uploaded for this listing yet.</div>';
    }
    openModal(previewBackdrop);
  }
  document.getElementById("closePreviewModal").addEventListener("click", function(){ closeModal(previewBackdrop); });
  previewBackdrop.addEventListener("click", function(e){ if (e.target === previewBackdrop) closeModal(previewBackdrop); });

  /* ================= CHAT PAGE ================= */
  var activeChatEmail = null;
  var chatSearchQuery = "";
  var chatEmojiList = ["\uD83D\uDE00","\uD83D\uDE02","\uD83D\uDE0D","\uD83D\uDC4D","\uD83D\uDE4F","\uD83C\uDF89","\uD83D\uDE22","\uD83D\uDE2E","\u2764\uFE0F","\uD83D\uDD25","\uD83D\uDCDA","\u2705"];

  var chatApp = document.getElementById("chatApp");
  var chatConvList = document.getElementById("chatConvList");
  var chatConvEmpty = document.getElementById("chatConvEmpty");
  var chatSearchInput = document.getElementById("chatSearchInput");
  var chatMainEmpty = document.getElementById("chatMainEmpty");
  var chatMainActive = document.getElementById("chatMainActive");
  var chatHeaderAvatar = document.getElementById("chatHeaderAvatar");
  var chatHeaderName = document.getElementById("chatHeaderName");
  var chatHeaderStatus = document.getElementById("chatHeaderStatus");
  var chatMessagesBox = document.getElementById("chatMessages");
  var chatTypingIndicator = document.getElementById("chatTypingIndicator");
  var chatMsgInput = document.getElementById("chatMsgInput");
  var chatEmojiBtn = document.getElementById("chatEmojiBtn");
  var chatEmojiPanel = document.getElementById("chatEmojiPanel");

  function sellerNameFromEmail(email){
    var namePart = (email.split("@")[0] || "seller");
    return namePart.split(/[._0-9]+/).filter(Boolean).map(function(p){
      return p.charAt(0).toUpperCase() + p.slice(1);
    }).join(" ") || "Seller";
  }
  function sellerOnlineFromEmail(email){
    var sum = 0;
    for (var i = 0; i < email.length; i++) sum += email.charCodeAt(i);
    return (sum % 3) !== 0;
  }
  function emailSeedNumber(email){
    var sum = 0;
    for (var i = 0; i < email.length; i++) sum = (sum * 31 + email.charCodeAt(i)) % 100000;
    return sum;
  }
  function sellerRatingFromEmail(email){
    var seed = emailSeedNumber(email);
    return (3.6 + (seed % 14) / 10).toFixed(1);
  }
  function sellerSoldCountFromEmail(email){
    return 4 + (emailSeedNumber(email) % 47);
  }
  function sellerResponseTimeFromEmail(email){
    var opts = ["under 10 minutes","within 30 minutes","within an hour","within a few hours"];
    return opts[emailSeedNumber(email) % opts.length];
  }
  function chatTimeLabel(ts){
    var d = new Date(ts);
    var h = d.getHours(), m = d.getMinutes();
    var ampm = h >= 12 ? "PM" : "AM";
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    return h12 + ":" + (m < 10 ? "0" : "") + m + " " + ampm;
  }
  function ensureConversation(listing){
    var email = listing.contactEmail;
    if (!conversations[email]) {
      conversations[email] = {
        sellerEmail: email,
        sellerName: sellerNameFromEmail(email),
        online: sellerOnlineFromEmail(email),
        listingTitle: listing.title,
        unread: 0,
        messages: [
          { from:"system", text:"You're messaging the poster of \"" + listing.title + "\". Say hello!", time: Date.now() }
        ]
      };
    } else {
      conversations[email].listingTitle = listing.title;
    }
    return conversations[email];
  }
  function chatLastMessagePreview(conv){
    var msgs = conv.messages.filter(function(m){ return m.from !== "system"; });
    var last = msgs.length ? msgs[msgs.length - 1] : conv.messages[conv.messages.length - 1];
    if (!last) return { text:"", time:0 };
    var text = last.type === "image" ? "\uD83D\uDCF7 Photo" : last.type === "pdf" ? "\uD83D\uDCC4 " + (last.fileName || "Document") : last.text;
    return { text: text, time: last.time };
  }
  function renderChatSidebar(){
    var emails = Object.keys(conversations);
    var items = emails.map(function(e){ return conversations[e]; });
    var q = chatSearchQuery.trim().toLowerCase();
    if (q) {
      items = items.filter(function(c){
        var preview = chatLastMessagePreview(c);
        return c.sellerName.toLowerCase().indexOf(q) !== -1 || preview.text.toLowerCase().indexOf(q) !== -1;
      });
    }
    items.sort(function(a, b){ return chatLastMessagePreview(b).time - chatLastMessagePreview(a).time; });
    chatConvEmpty.classList.toggle("hidden", items.length !== 0 || emails.length !== 0);
    if (emails.length === 0) {
      chatConvList.innerHTML = "";
    } else {
      chatConvList.innerHTML = items.map(function(c){
        var preview = chatLastMessagePreview(c);
        var active = c.sellerEmail === activeChatEmail ? " active" : "";
        return (
          '<button class="chat-conv-item' + active + '" data-email="' + escapeHtml(c.sellerEmail) + '">' +
            '<span class="avatar chat-conv-avatar">' + escapeHtml(initials(c.sellerName)) + (c.online ? '<span class="online-dot" title="Online"></span>' : '') + '</span>' +
            '<span class="chat-conv-meta">' +
              '<span class="chat-conv-top-row"><span class="chat-conv-name">' + escapeHtml(c.sellerName) + '</span><span class="chat-conv-time">' + (preview.time ? chatTimeLabel(preview.time) : "") + '</span></span>' +
              '<span class="chat-conv-bottom-row"><span class="chat-conv-last">' + escapeHtml(preview.text) + '</span>' + (c.unread > 0 ? '<span class="chat-unread-badge">' + c.unread + '</span>' : '') + '</span>' +
            '</span>' +
          '</button>'
        );
      }).join("");
    }
    Array.prototype.forEach.call(chatConvList.querySelectorAll(".chat-conv-item"), function(btn){
      btn.addEventListener("click", function(){ selectConversation(btn.dataset.email); });
    });
  }
  function renderChatMessages(){
    var conv = conversations[activeChatEmail];
    if (!conv) return;
    chatMessagesBox.innerHTML = conv.messages.map(function(m){
      if (m.from === "system") return '<div class="chat-msg-system">' + escapeHtml(m.text) + '</div>';
      var bubbleClass = "chat-bubble " + (m.from === "me" ? "me" : "them");
      var body;
      if (m.type === "image") {
        body = '<img class="chat-msg-image" src="' + m.dataUrl + '" alt="Shared image">';
      } else if (m.type === "pdf") {
        body = '<div class="chat-msg-file"><span class="chat-file-icon">&#128206;</span><span class="chat-file-name">' + escapeHtml(m.fileName || "Document.pdf") + '</span></div>';
      } else {
        body = '<div class="chat-msg-text">' + escapeHtml(m.text) + '</div>';
      }
      return '<div class="' + bubbleClass + '">' + body + '<span class="chat-msg-time">' + chatTimeLabel(m.time) + '</span></div>';
    }).join("");
    chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
  }
  function selectConversation(email){
    var conv = conversations[email];
    if (!conv) return;
    activeChatEmail = email;
    conv.unread = 0;
    chatMainEmpty.classList.add("hidden");
    chatMainActive.classList.remove("hidden");
    chatHeaderAvatar.textContent = initials(conv.sellerName);
    chatHeaderName.textContent = conv.sellerName;
    chatHeaderStatus.textContent = conv.online ? "Online" : "Offline";
    chatHeaderStatus.classList.toggle("online", conv.online);
    chatTypingIndicator.classList.add("hidden");
    renderChatMessages();
    renderChatSidebar();
    chatApp.classList.add("chat-mobile-active");
    chatMsgInput.focus();
  }
  function openChatForListing(id){
    var listing = listings.find(function(l){ return l.id === id; });
    if (!listing) return;
    ensureConversation(listing);
    showView("chat");
    selectConversation(listing.contactEmail);
  }
  function scheduleChatAutoReply(email){
    if (activeChatEmail === email) chatTypingIndicator.classList.remove("hidden");
    setTimeout(function(){
      var conv = conversations[email];
      if (!conv) return;
      var reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      conv.messages.push({ from:"them", text: reply, type:"text", time: Date.now() });
      if (activeChatEmail === email) {
        chatTypingIndicator.classList.add("hidden");
        renderChatMessages();
      } else {
        conv.unread = (conv.unread || 0) + 1;
        addNotification("New message from " + conv.sellerName);
      }
      renderChatSidebar();
    }, 1100 + Math.floor(Math.random() * 700));
  }
  function sendChatMessage(){
    var text = chatMsgInput.value.trim();
    if (!text || !activeChatEmail) return;
    var conv = conversations[activeChatEmail];
    conv.messages.push({ from:"me", text: text, type:"text", time: Date.now() });
    chatMsgInput.value = "";
    renderChatMessages();
    renderChatSidebar();
    scheduleChatAutoReply(activeChatEmail);
  }
  function handleChatFile(file, type){
    if (!file || !activeChatEmail) return;
    var reader = new FileReader();
    reader.onload = function(e){
      var conv = conversations[activeChatEmail];
      conv.messages.push({
        from:"me", type: type,
        dataUrl: type === "image" ? e.target.result : undefined,
        fileName: file.name, time: Date.now()
      });
      renderChatMessages();
      renderChatSidebar();
      scheduleChatAutoReply(activeChatEmail);
    };
    reader.readAsDataURL(file);
  }

  chatSearchInput.addEventListener("input", function(e){ chatSearchQuery = e.target.value; renderChatSidebar(); });
  chatMsgInput.addEventListener("keydown", function(e){ if (e.key === "Enter") { e.preventDefault(); sendChatMessage(); } });
  document.getElementById("chatMsgSendBtn").addEventListener("click", sendChatMessage);
  document.getElementById("chatBackBtn").addEventListener("click", function(){ chatApp.classList.remove("chat-mobile-active"); });
  document.getElementById("chatImageInput").addEventListener("change", function(e){ handleChatFile(e.target.files[0], "image"); e.target.value = ""; });
  document.getElementById("chatPdfInput").addEventListener("change", function(e){ handleChatFile(e.target.files[0], "pdf"); e.target.value = ""; });
  document.getElementById("chatCameraInput").addEventListener("change", function(e){ handleChatFile(e.target.files[0], "image"); e.target.value = ""; });

  chatEmojiPanel.innerHTML = chatEmojiList.map(function(em){ return '<button type="button" class="chat-emoji-item">' + em + '</button>'; }).join("");
  Array.prototype.forEach.call(chatEmojiPanel.querySelectorAll(".chat-emoji-item"), function(btn){
    btn.addEventListener("click", function(){
      chatMsgInput.value += btn.textContent;
      chatEmojiPanel.classList.add("hidden");
      chatMsgInput.focus();
    });
  });
  chatEmojiBtn.addEventListener("click", function(e){ e.stopPropagation(); chatEmojiPanel.classList.toggle("hidden"); });
  document.addEventListener("click", function(e){
    if (!chatEmojiPanel.classList.contains("hidden") && !chatEmojiPanel.contains(e.target) && e.target !== chatEmojiBtn) {
      chatEmojiPanel.classList.add("hidden");
    }
  });

  /* ================= BOOK DETAIL PAGE ================= */
  var bdMainImage = document.getElementById("bookMainImage");
  var bdGalleryThumbs = document.getElementById("bookGalleryThumbs");
  var bdTitle = document.getElementById("bdTitle");
  var bdFavBtn = document.getElementById("bdFavBtn");
  var bdInfoGrid = document.getElementById("bdInfoGrid");
  var bdPricingCard = document.getElementById("bdPricingCard");
  var bdSellerCard = document.getElementById("bdSellerCard");
  var bdActionsRow = document.getElementById("bdActionsRow");
  var bdDescription = document.getElementById("bdDescription");
  var bdHighlights = document.getElementById("bdHighlights");
  var bdIncluded = document.getElementById("bdIncluded");
  var bdSpecTable = document.getElementById("bdSpecTable");
  var bdDeliveryCard = document.getElementById("bdDeliveryCard");
  var bdReviewsCard = document.getElementById("bdReviewsCard");
  var bdSimilarStrip = document.getElementById("bdSimilarStrip");
  var bdRecentStrip = document.getElementById("bdRecentStrip");
  var bdStickySidebar = document.getElementById("bdStickySidebar");

  function conditionBadgeClass(condition){
    var key = condition.toLowerCase().replace(/\s+/g, "");
    if (key === "new") return "condition-new";
    if (key === "likenew") return "condition-likenew";
    if (key === "good") return "condition-good";
    return "condition-fair"; // fair, worn, etc.
  }
  function miniBookCardHtml(listing){
    var img = bookImageSet(listing)[0];
    var priceText = listing.type === "sell" ? ("&#8377;" + (listing.price != null ? listing.price : "?")) :
      listing.type === "swap" ? "Swap" : "Free";
    return '<div class="mini-book-card book-clickable" data-id="' + listing.id + '">' +
      '<div class="mini-book-cover"><img src="' + img.url + '" alt="' + escapeHtml(listing.title) + '"></div>' +
      '<p class="mini-book-title">' + escapeHtml(listing.title) + '</p>' +
      '<p class="mini-book-price">' + priceText + '</p>' +
    '</div>';
  }
  function bindMiniBookCards(container){
    Array.prototype.forEach.call(container.querySelectorAll(".mini-book-card"), function(el){
      el.addEventListener("click", function(){ openBookDetail(parseInt(el.dataset.id, 10)); });
    });
  }

  function openBookDetail(id){
    var listing = listings.find(function(l){ return l.id === id; });
    if (!listing) return;
    trackRecentlyViewed(id);
    activeListingId = id;
    showView("bookdetail");
    renderBookDetail(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderBookDetail(id){
    var listing = listings.find(function(l){ return l.id === id; });
    if (!listing) return;
    var avg = averageRating(listing.reviews);
    var images = bookImageSet(listing);
    var isFav = favorites.indexOf(listing.id) !== -1;

    // Gallery
    bdMainImage.src = images[0].url;
    bdMainImage.alt = listing.title;
    bdGalleryThumbs.innerHTML = images.map(function(img, i){
      return '<div class="book-gallery-thumb' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '"><img src="' + img.url + '" alt="' + escapeHtml(img.label) + '"></div>';
    }).join("");
    Array.prototype.forEach.call(bdGalleryThumbs.querySelectorAll(".book-gallery-thumb"), function(t){
      t.addEventListener("click", function(){
        bdMainImage.src = images[parseInt(t.dataset.idx, 10)].url;
        Array.prototype.forEach.call(bdGalleryThumbs.querySelectorAll(".book-gallery-thumb"), function(o){ o.classList.remove("active"); });
        t.classList.add("active");
      });
    });

    // Title + fav
    bdTitle.textContent = listing.title;
    bdFavBtn.innerHTML = isFav ? "&#9829;" : "&#9825;";
    bdFavBtn.classList.toggle("active", isFav);
    bdFavBtn.onclick = function(){ requireLogin(function(){ toggleFavorite(listing.id); renderBookDetail(listing.id); }); };

    // Book information grid
    bdInfoGrid.innerHTML =
      bdField("Author", listing.author || "Not specified") +
      bdField("Subject", listing.subject) +
      bdField("Publisher", listing.publisher) +
      bdField("Edition", listing.edition) +
      bdField("ISBN", listing.isbn) +
      bdField("Language", listing.language) +
      bdField("Pages", listing.pages) +
      bdField("Semester", listing.semester) +
      bdField("Branch", listing.department) +
      bdField("Category", listing.category);

    // Pricing section
    var statusLabels = { available:"In Stock", reserved:"Reserved", sold:"Sold", exchanged:"Exchanged" };
    var pricingHtml = "";
    if (listing.type === "sell") {
      var discount = listing.originalPrice && listing.originalPrice > listing.price
        ? Math.round(100 * (listing.originalPrice - listing.price) / listing.originalPrice) : 0;
      pricingHtml += '<div class="book-pricing-row">' +
        (listing.originalPrice ? '<span class="book-price-original">&#8377;' + listing.originalPrice + '</span>' : "") +
        '<span class="book-price-selling">&#8377;' + listing.price + '</span>' +
        (discount > 0 ? '<span class="book-discount-badge">' + discount + '% off</span>' : "") +
      '</div>';
    } else if (listing.type === "swap") {
      pricingHtml += '<div class="book-pricing-row"><span class="book-price-selling">Swap</span></div>' +
        '<p class="meta-line">Wants: ' + escapeHtml(listing.wants || "open to offers") + '</p>';
    } else {
      pricingHtml += '<div class="book-pricing-row"><span class="book-price-selling free-color">Free</span></div>';
    }
    pricingHtml += '<div class="book-pricing-meta">' +
      '<span class="status-badge status-' + listing.status + '">' + statusLabels[listing.status] + '</span>' +
      '<span class="condition-badge ' + conditionBadgeClass(listing.condition) + '">' + escapeHtml(listing.condition) + '</span>' +
    '</div>';
    bdPricingCard.innerHTML = pricingHtml;

    // Seller card
    var sellerName = sellerNameFromEmail(listing.contactEmail);
    var sellerOnline = sellerOnlineFromEmail(listing.contactEmail);
    bdSellerCard.innerHTML =
      '<span class="avatar seller-card-avatar">' + escapeHtml(initials(sellerName)) + '</span>' +
      '<div class="seller-card-info">' +
        '<div class="seller-card-name-row"><span class="seller-card-name">' + escapeHtml(sellerName) + '</span>' +
          (listing.verified ? '<span class="seller-verified-pill">&#10003; Verified Student</span>' : "") +
        '</div>' +
        '<div class="seller-card-meta">' + escapeHtml(listing.department) + ' &middot; ' + escapeHtml(listing.semester) + ' &middot; ' + (sellerOnline ? "Online now" : "Offline") + '</div>' +
        '<div class="seller-card-stats">' +
          '<span>&#9733; <b>' + sellerRatingFromEmail(listing.contactEmail) + '</b></span>' +
          '<span><b>' + sellerSoldCountFromEmail(listing.contactEmail) + '</b> books sold</span>' +
          '<span>Replies ' + sellerResponseTimeFromEmail(listing.contactEmail) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="seller-card-actions">' +
        '<button class="btn btn-outline btn-small" id="bdChatSellerBtn">Chat Seller</button>' +
        '<button class="btn btn-outline btn-small" id="bdViewSellerBtn">View Seller Profile</button>' +
      '</div>';
    document.getElementById("bdChatSellerBtn").addEventListener("click", function(){ requireLogin(function(){ openChatForListing(listing.id); }); });
    document.getElementById("bdViewSellerBtn").addEventListener("click", function(){ bdSellerCard.classList.toggle("expanded"); bdSellerCard.scrollIntoView({ behavior:"smooth", block:"center" }); });

    // Action buttons
    var buyLabel = listing.type === "sell" ? "Buy Now" : listing.type === "swap" ? "Propose Swap" : "Claim for Free";
    var canAct = listing.status === "available";
    bdActionsRow.innerHTML =
      '<button class="btn btn-primary" id="bdBuyBtn"' + (canAct ? "" : " disabled") + '>' + buyLabel + '</button>' +
      '<button class="btn btn-outline" id="bdWishlistBtn">' + (isFav ? "Saved to Wishlist" : "Add to Wishlist") + '</button>' +
      '<button class="btn btn-outline" id="bdSwapBtn">Swap Book</button>' +
      '<button class="btn btn-outline" id="bdRentBtn">Rent Book</button>' +
      '<button class="btn btn-outline" id="bdShareBtn">Share Listing</button>' +
      '<button class="btn-link" id="bdReportBtn">Report Listing</button>';
    document.getElementById("bdBuyBtn").addEventListener("click", function(){ requireLogin(function(){ reserveListing(listing.id); renderBookDetail(listing.id); }); });
    document.getElementById("bdWishlistBtn").addEventListener("click", function(){ requireLogin(function(){ toggleFavorite(listing.id); renderBookDetail(listing.id); }); });
    document.getElementById("bdSwapBtn").addEventListener("click", function(){ requireLogin(function(){ openChatForListing(listing.id); }); });
    document.getElementById("bdRentBtn").addEventListener("click", function(){ requireLogin(function(){ openChatForListing(listing.id); }); });
    document.getElementById("bdReportBtn").addEventListener("click", function(){ requireLogin(function(){ openReport(listing.id); }); });
    document.getElementById("bdShareBtn").addEventListener("click", function(){
      var shareText = listing.title + " — Campus Shelf listing";
      if (navigator.share) {
        navigator.share({ title: listing.title, text: shareText }).catch(function(){});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(function(){ addNotification("Listing details copied to clipboard."); });
      } else {
        alert(shareText);
      }
    });

    // Description
    bdDescription.textContent = listing.description;
    bdHighlights.innerHTML = listing.highlights.map(function(h){ return "<li>" + escapeHtml(h) + "</li>"; }).join("");
    bdIncluded.innerHTML = listing.whatsIncluded.map(function(h){ return "<li>" + escapeHtml(h) + "</li>"; }).join("");

    // Specifications table
    var specRows = [
      ["Author", listing.author || "—"], ["Publication", listing.publisher], ["Edition", listing.edition],
      ["Subject", listing.subject], ["Branch", listing.department], ["Semester", listing.semester],
      ["Condition", listing.condition], ["Language", listing.language], ["Pages", listing.pages]
    ];
    bdSpecTable.innerHTML = specRows.map(function(r){
      return "<tr><td>" + escapeHtml(r[0]) + "</td><td>" + escapeHtml(String(r[1])) + "</td></tr>";
    }).join("");

    // Delivery / pickup
    var pickupLocation = listing.pickup ? listing.pickup.location : "Main Library entrance";
    var pickupTime = listing.pickup ? (listing.pickup.date + " at " + listing.pickup.time) : "Usually within 24 hours of confirming";
    bdDeliveryCard.innerHTML = '<h2>Delivery &amp; Pickup</h2><div class="delivery-grid">' +
      '<div class="delivery-item"><strong>Campus Pickup Location</strong>' + escapeHtml(pickupLocation) + '</div>' +
      '<div class="delivery-item"><strong>Estimated Pickup Time</strong>' + escapeHtml(pickupTime) + '</div>' +
      '<div class="delivery-item"><strong>Delivery Availability</strong>' + (listing.deliveryAvailable ? "Available on request" : "Not available — pickup only") + '</div>' +
    '</div>';

    // Reviews
    var dist = [0,0,0,0,0];
    listing.reviews.forEach(function(r){ if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++; });
    var maxDist = Math.max.apply(null, dist.concat([1]));
    var distHtml = [5,4,3,2,1].map(function(star){
      var count = dist[star - 1];
      var pct = Math.round(100 * count / maxDist);
      return '<div class="reviews-dist-row"><span>' + star + '&#9733;</span><span class="reviews-dist-bar-track"><span class="reviews-dist-bar-fill" style="width:' + pct + '%"></span></span><span>' + count + '</span></div>';
    }).join("");
    var reviewCardsHtml = listing.reviews.length
      ? listing.reviews.map(function(r){
          return '<div class="review-item"><div class="review-head"><span class="review-author">' + escapeHtml(r.author) + '</span><span class="stars">' + starString(r.rating) + '</span></div><p class="review-text">' + escapeHtml(r.text) + '</p></div>';
        }).join("")
      : '<p class="field-hint">No reviews yet — be the first to review this listing.</p>';
    bdReviewsCard.innerHTML = '<h2>Student Reviews</h2>' +
      '<div class="reviews-overview">' +
        '<div class="reviews-score"><div class="big-num">' + avg.toFixed(1) + '</div><div class="stars">' + starString(avg) + '</div><div class="field-hint">' + listing.reviews.length + ' review' + (listing.reviews.length === 1 ? "" : "s") + '</div></div>' +
        '<div class="reviews-dist">' + distHtml + '</div>' +
      '</div>' +
      reviewCardsHtml +
      '<button class="btn btn-outline btn-small" id="bdWriteReviewBtn" style="margin-top:12px;">Write a Review</button>';
    document.getElementById("bdWriteReviewBtn").addEventListener("click", function(){ openReview(listing.id); });

    // Similar books
    var similar = listings.filter(function(l){
      return !l.archived && l.id !== listing.id && (l.department === listing.department || l.course === listing.course);
    }).slice(0, 10);
    bdSimilarStrip.innerHTML = similar.length
      ? similar.map(miniBookCardHtml).join("")
      : '<p class="field-hint">No similar books found yet.</p>';
    bindMiniBookCards(bdSimilarStrip);

    // Recently viewed (excluding current)
    var recentOthers = recentlyViewed
      .filter(function(rid){ return rid !== listing.id; })
      .map(function(rid){ return listings.find(function(l){ return l.id === rid && !l.archived; }); })
      .filter(Boolean);
    bdRecentStrip.innerHTML = recentOthers.length
      ? recentOthers.map(miniBookCardHtml).join("")
      : '<p class="field-hint">Books you view will show up here.</p>';
    bindMiniBookCards(bdRecentStrip);

    // Sticky sidebar (desktop)
    var sidebarPriceText = listing.type === "sell" ? ("&#8377;" + listing.price) : listing.type === "swap" ? "Swap" : "Free";
    bdStickySidebar.innerHTML =
      '<div class="sidebar-price">' + sidebarPriceText + '</div>' +
      '<div class="sidebar-seller">Sold by ' + escapeHtml(sellerName) + '</div>' +
      '<button class="btn btn-primary" id="bdSideBuyBtn"' + (canAct ? "" : " disabled") + '>' + buyLabel + '</button>' +
      '<button class="btn btn-outline" id="bdSideChatBtn">Chat Seller</button>' +
      '<button class="btn btn-outline" id="bdSideWishlistBtn">' + (isFav ? "Saved to Wishlist" : "Add to Wishlist") + '</button>';
    document.getElementById("bdSideBuyBtn").addEventListener("click", function(){ requireLogin(function(){ reserveListing(listing.id); renderBookDetail(listing.id); }); });
    document.getElementById("bdSideChatBtn").addEventListener("click", function(){ requireLogin(function(){ openChatForListing(listing.id); }); });
    document.getElementById("bdSideWishlistBtn").addEventListener("click", function(){ requireLogin(function(){ toggleFavorite(listing.id); renderBookDetail(listing.id); }); });
  }
  function bdField(label, value){
    return '<div class="bd-field"><strong>' + escapeHtml(label) + ':</strong>' + escapeHtml(String(value)) + '</div>';
  }
  document.getElementById("bookDetailBackBtn").addEventListener("click", function(){ showView("browse"); });

  /* ================= REVIEWS ================= */
  var reviewBackdrop = document.getElementById("reviewBackdrop");
  var reviewSub = document.getElementById("reviewSub");
  var existingReviews = document.getElementById("existingReviews");
  var reviewForm = document.getElementById("reviewForm");
  var starPicker = document.getElementById("starPicker");
  var selectedRating = 0;

  function openReview(id){
    activeListingId = id;
    var listing = listings.find(function(l){ return l.id === id; });
    if (!listing) return;
    reviewSub.textContent = listing.title;
    existingReviews.innerHTML = listing.reviews.length
      ? listing.reviews.map(function(r){
          return '<div class="review-item"><div class="review-head"><span class="review-author">' + escapeHtml(r.author) + '</span><span class="stars">' + starString(r.rating) + '</span></div><p class="review-text">' + escapeHtml(r.text) + '</p></div>';
        }).join("")
      : '<p class="field-hint">No reviews yet — be the first.</p>';
    selectedRating = 0;
    updateStarPicker();
    openModal(reviewBackdrop);
  }
  Array.prototype.forEach.call(starPicker.querySelectorAll("button"), function(btn){
    btn.addEventListener("click", function(){ selectedRating = parseInt(btn.dataset.val,10); updateStarPicker(); });
  });
  function updateStarPicker(){
    Array.prototype.forEach.call(starPicker.querySelectorAll("button"), function(btn){
      btn.classList.toggle("active", parseInt(btn.dataset.val,10) <= selectedRating);
    });
  }
  reviewForm.addEventListener("submit", function(e){
    e.preventDefault();
    requireLogin(function(){
      if (!selectedRating) { alert("Choose a star rating first."); return; }
      var listing = listings.find(function(l){ return l.id === activeListingId; });
      if (!listing) return;
      listing.reviews.push({ rating: selectedRating, text: document.getElementById("r-text").value.trim(), author: currentUser.name });
      reviewForm.reset();
      selectedRating = 0;
      renderBrowse();
      openReview(activeListingId);
    });
  });
  document.getElementById("closeReviewModal").addEventListener("click", function(){ closeModal(reviewBackdrop); });
  reviewBackdrop.addEventListener("click", function(e){ if (e.target === reviewBackdrop) closeModal(reviewBackdrop); });

  /* ================= REPORT ================= */
  var reportBackdrop = document.getElementById("reportBackdrop");
  var reportSub = document.getElementById("reportSub");
  var reportForm = document.getElementById("reportForm");

  function openReport(id){
    activeListingId = id;
    var listing = listings.find(function(l){ return l.id === id; });
    if (!listing) return;
    reportSub.textContent = listing.title;
    openModal(reportBackdrop);
  }
  reportForm.addEventListener("submit", function(e){
    e.preventDefault();
    var listing = listings.find(function(l){ return l.id === activeListingId; });
    if (!listing) return;
    listing.reports.push({
      reason: document.getElementById("rep-reason").value,
      details: document.getElementById("rep-details").value.trim()
    });
    reportForm.reset();
    closeModal(reportBackdrop);
    alert("Thanks — this listing has been flagged for admin review.");
  });
  document.getElementById("closeReportModal").addEventListener("click", function(){ closeModal(reportBackdrop); });
  reportBackdrop.addEventListener("click", function(e){ if (e.target === reportBackdrop) closeModal(reportBackdrop); });

  /* ================= WISHLIST ================= */
  var wishlistForm = document.getElementById("wishlistForm");
  var wishlistList = document.getElementById("wishlistList");

  function isNowAvailable(item){
    var needle = item.title.toLowerCase();
    return listings.some(function(l){
      if (l.archived) return false;
      var hay = l.title.toLowerCase();
      return hay.indexOf(needle) !== -1 || needle.indexOf(hay) !== -1;
    });
  }
  function renderWishlist(){
    wishlistList.innerHTML = wishlist.map(function(item){
      var available = isNowAvailable(item);
      return (
        '<div class="wishlist-item">' +
          '<div><h4>' + escapeHtml(item.title) + '</h4><p class="meta-line">' + escapeHtml(item.department) + (item.course ? ' &middot; ' + escapeHtml(item.course) : '') + ' &middot; ' + escapeHtml(item.semester) + ' &middot; requested by ' + escapeHtml(item.requestedBy) + '</p></div>' +
          '<span class="' + (available ? 'available-badge' : 'waiting-badge') + '">' + (available ? 'Now available!' : 'Waiting') + '</span>' +
        '</div>'
      );
    }).join("");
    document.getElementById("statWishlist").textContent = wishlist.length;
  }
  wishlistForm.addEventListener("submit", function(e){
    e.preventDefault();
    requireLogin(function(){
      wishlist.unshift({
        id: nextWishlistId++,
        title: document.getElementById("w-title").value.trim(),
        department: document.getElementById("w-department").value,
        course: document.getElementById("w-course").value.trim().toUpperCase(),
        semester: document.getElementById("w-semester").value,
        requestedBy: currentUser.name
      });
      wishlistForm.reset();
      renderWishlist();
    });
  });

  /* ================= PICKUP SCHEDULER ================= */
  var pickupBackdrop = document.getElementById("pickupBackdrop");
  var pickupForm = document.getElementById("pickupForm");
  var pickupSub = document.getElementById("pickupSub");

  function openPickup(id){
    activeListingId = id;
    var listing = listings.find(function(l){ return l.id === id; });
    if (!listing) return;
    pickupSub.textContent = listing.title;
    if (listing.pickup) {
      document.getElementById("p-date").value = listing.pickup.date;
      document.getElementById("p-time").value = listing.pickup.time;
      document.getElementById("p-location").value = listing.pickup.location;
    } else {
      pickupForm.reset();
    }
    openModal(pickupBackdrop);
  }
  pickupForm.addEventListener("submit", function(e){
    e.preventDefault();
    var listing = listings.find(function(l){ return l.id === activeListingId; });
    if (!listing) return;
    listing.pickup = {
      date: document.getElementById("p-date").value,
      time: document.getElementById("p-time").value,
      location: document.getElementById("p-location").value
    };
    addNotification('Pickup scheduled for "' + listing.title + '" — ' + listing.pickup.date + ' at ' + listing.pickup.time + ', ' + listing.pickup.location + '.');
    closeModal(pickupBackdrop);
    renderBrowse();
  });
  document.getElementById("closePickupModal").addEventListener("click", function(){ closeModal(pickupBackdrop); });
  pickupBackdrop.addEventListener("click", function(e){ if (e.target === pickupBackdrop) closeModal(pickupBackdrop); });

  /* ================= QR EXCHANGE CONFIRMATION ================= */
  var qrBackdrop = document.getElementById("qrBackdrop");
  var qrImage = document.getElementById("qrImage");
  var scanCheckBuyer = document.getElementById("scanCheckBuyer");
  var scanCheckSeller = document.getElementById("scanCheckSeller");

  function openQr(id){
    activeListingId = id;
    var listing = listings.find(function(l){ return l.id === id; });
    if (!listing) return;
    if (!listing.qr.code) listing.qr.code = "SHELF-" + listing.id + "-" + Math.random().toString(36).slice(2,8).toUpperCase();
    qrImage.src = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + encodeURIComponent(listing.qr.code);
    updateQrChecks(listing);
    openModal(qrBackdrop);
  }
  function updateQrChecks(listing){
    scanCheckBuyer.innerHTML = (listing.qr.buyerScanned ? "&#9989; " : "&#9675; ") + "Buyer scanned";
    scanCheckBuyer.classList.toggle("done", listing.qr.buyerScanned);
    scanCheckSeller.innerHTML = (listing.qr.sellerScanned ? "&#9989; " : "&#9675; ") + "Seller scanned";
    scanCheckSeller.classList.toggle("done", listing.qr.sellerScanned);
  }
  function markScanned(who){
    var listing = listings.find(function(l){ return l.id === activeListingId; });
    if (!listing) return;
    if (who === "buyer") listing.qr.buyerScanned = true; else listing.qr.sellerScanned = true;
    updateQrChecks(listing);
    if (listing.qr.buyerScanned && listing.qr.sellerScanned) {
      listing.status = listing.type === "sell" ? "sold" : "exchanged";
      listing.completedAt = new Date().toISOString();
      addNotification('Exchange complete for "' + listing.title + '" — marked ' + listing.status + '.');
      closeModal(qrBackdrop);
      renderBrowse();
      if (!views.orders.classList.contains("hidden")) renderOrders();
    }
  }
  document.getElementById("markBuyerScanned").addEventListener("click", function(){ markScanned("buyer"); });
  document.getElementById("markSellerScanned").addEventListener("click", function(){ markScanned("seller"); });
  document.getElementById("closeQrModal").addEventListener("click", function(){ closeModal(qrBackdrop); });
  qrBackdrop.addEventListener("click", function(e){ if (e.target === qrBackdrop) closeModal(qrBackdrop); });

  /* ================= SEMESTER LIST ================= */
  var semesterListGrid = document.getElementById("semesterListGrid");
  var semesterListEmpty = document.getElementById("semesterListEmpty");
  var semesterListSub = document.getElementById("semesterListSub");
  function renderSemesterList(){
    if (!currentUser || !currentUser.department || !currentUser.semester) {
      semesterListSub.textContent = "Log in with your department and semester to see books recommended for you automatically.";
      semesterListGrid.innerHTML = "";
      semesterListEmpty.classList.add("hidden");
      return;
    }
    semesterListSub.textContent = "Recommended for " + currentUser.department + ", " + currentUser.semester + ".";
    var matched = listings.filter(function(l){
      return !l.archived && l.department === currentUser.department && l.semester === currentUser.semester;
    });
    semesterListGrid.innerHTML = matched.map(cardHtml).join("");
    semesterListEmpty.classList.toggle("hidden", matched.length !== 0);
    bindCardButtons(semesterListGrid);
  }

  /* ================= PREVIOUS-YEAR PAPERS ================= */
  var paperSubjectFilter = document.getElementById("paperSubjectFilter");
  var paperYearFilter = document.getElementById("paperYearFilter");
  var papersList = document.getElementById("papersList");
  var papersEmpty = document.getElementById("papersEmpty");

  fillSelect(paperSubjectFilter, uniqueSorted(papers.map(function(p){ return p.subject; })), "All subjects");
  fillSelect(paperYearFilter, uniqueSorted(papers.map(function(p){ return p.year; })).sort().reverse(), "All years");

  function renderPapers(){
    var subject = paperSubjectFilter.value;
    var year = paperYearFilter.value;
    var matched = papers.filter(function(p){
      return (!subject || p.subject === subject) && (!year || p.year === year);
    });
    papersList.innerHTML = matched.map(function(p){
      return (
        '<div class="paper-row">' +
          '<div><h4>' + escapeHtml(p.subject) + '</h4><p class="meta-line">' + escapeHtml(p.course) + ' &middot; ' + escapeHtml(p.department) + ' &middot; ' + escapeHtml(p.year) + '</p></div>' +
          '<button class="btn btn-outline btn-small">View paper</button>' +
        '</div>'
      );
    }).join("");
    papersEmpty.classList.toggle("hidden", matched.length !== 0);
  }
  paperSubjectFilter.addEventListener("change", renderPapers);
  paperYearFilter.addEventListener("change", renderPapers);

  /* ================= SYLLABUS ================= */
  var syllabusForm = document.getElementById("syllabusForm");
  var syllabusFileInput = document.getElementById("s-file");
  var syllabusListEl = document.getElementById("syllabusList");
  var pendingSyllabusUpload = null;

  syllabusFileInput.addEventListener("change", function(){
    var file = syllabusFileInput.files[0];
    pendingSyllabusUpload = file ? URL.createObjectURL(file) : null;
  });
  syllabusForm.addEventListener("submit", function(e){
    e.preventDefault();
    requireLogin(function(){
      syllabusList.unshift({
        id: nextSyllabusId++,
        title: document.getElementById("s-title").value.trim(),
        department: document.getElementById("s-department").value,
        fileUrl: pendingSyllabusUpload,
        uploadedBy: currentUser.name
      });
      syllabusForm.reset();
      pendingSyllabusUpload = null;
      renderSyllabus();
    });
  });
  function renderSyllabus(){
    syllabusListEl.innerHTML = syllabusList.map(function(s){
      var link = s.fileUrl
        ? '<a class="btn btn-outline btn-small" href="' + s.fileUrl + '" target="_blank" rel="noopener">Download</a>'
        : '<span class="btn btn-outline btn-small" style="opacity:.6; cursor:default;">No file</span>';
      return (
        '<div class="syllabus-row">' +
          '<div><h4>' + escapeHtml(s.title) + '</h4><p class="meta-line">' + escapeHtml(s.department) + ' &middot; uploaded by ' + escapeHtml(s.uploadedBy) + '</p></div>' +
          link +
        '</div>'
      );
    }).join("");
  }

  /* ================= RECENTLY VIEWED ================= */
  var recentGrid = document.getElementById("recentGrid");
  var recentEmpty = document.getElementById("recentEmpty");
  function renderRecent(){
    var recentListings = recentlyViewed
      .map(function(id){ return listings.find(function(l){ return l.id === id && !l.archived; }); })
      .filter(Boolean);
    recentGrid.innerHTML = recentListings.map(cardHtml).join("");
    recentEmpty.classList.toggle("hidden", recentListings.length !== 0);
    bindCardButtons(recentGrid);
  }

  /* ================= ORDER HISTORY ================= */
  var ordersList = document.getElementById("ordersList");
  var ordersEmpty = document.getElementById("ordersEmpty");
  function renderOrders(){
    if (!currentUser) {
      ordersList.innerHTML = "";
      ordersEmpty.textContent = "Log in to see your order history.";
      ordersEmpty.classList.remove("hidden");
      return;
    }
    var mine = listings.filter(function(l){
      return (l.status === "sold" || l.status === "exchanged") &&
        (l.reservedBy === currentUser.name || l.contactEmail === currentUser.email);
    });
    ordersList.innerHTML = mine.map(function(l){
      var role = l.contactEmail === currentUser.email ? "You listed this" : "You reserved this";
      var when = l.completedAt ? new Date(l.completedAt).toLocaleDateString() : "";
      return (
        '<div class="admin-row">' +
          '<div><h4>' + escapeHtml(l.title) + '</h4><p class="meta-line">' + role + ' &middot; ' + escapeHtml(l.status) + (when ? ' &middot; ' + when : '') + '</p></div>' +
          '<span class="status-badge status-' + l.status + '">' + l.status + '</span>' +
        '</div>'
      );
    }).join("");
    ordersEmpty.textContent = "No orders yet — reserve a listing to start one.";
    ordersEmpty.classList.toggle("hidden", mine.length !== 0);
  }

  /* ================= PROFILE / DASHBOARD / SETTINGS ================= */
  function renderProfile(){
    if (!currentUser) return;
    updateAllAvatars();
    document.getElementById("removePhotoBtn").classList.toggle("hidden", !currentUser.avatarUrl);
    document.getElementById("profileNameValue").textContent = currentUser.name;
    document.getElementById("profileEmailValue").textContent = currentUser.email;
    document.getElementById("profileDepartmentValue").textContent = currentUser.department || "\u2014";
    document.getElementById("profileSemesterValue").textContent = currentUser.semester || "\u2014";
    document.getElementById("profileBioInput").value = currentUser.bio || "";
    var myListings = listings.filter(function(l){ return l.contactEmail === currentUser.email; });
    var soldCount = myListings.filter(function(l){ return l.status === "sold"; }).length;
    document.getElementById("profileBooksUploaded").textContent = myListings.length;
    document.getElementById("profileBooksSold").textContent = soldCount;
    document.getElementById("profileWishlistCount").textContent = wishlist.length;
    document.getElementById("profileJoinedDate").textContent = currentUser.joinedDate || "\u2014";
  }

  document.getElementById("saveBioBtn").addEventListener("click", function(){
    if (!currentUser) return;
    currentUser.bio = document.getElementById("profileBioInput").value.trim();
    alert("Bio updated.");
  });

  function renderSettings(){
    if (!currentUser) return;
    document.getElementById("set-name").value = currentUser.name || "";
    document.getElementById("set-email").value = currentUser.email || "";
    document.getElementById("set-department").value = currentUser.department || "";
    document.getElementById("set-semester").value = currentUser.semester || "";
    document.getElementById("darkModeToggle").checked = document.documentElement.getAttribute("data-theme") === "dark";
  }

  document.getElementById("saveProfileBtn").addEventListener("click", function(){
    if (!currentUser) return;
    var name = document.getElementById("set-name").value.trim();
    if (!name) { alert("Name cannot be empty."); return; }
    currentUser.name = name;
    currentUser.department = document.getElementById("set-department").value.trim();
    currentUser.semester = document.getElementById("set-semester").value.trim();
    updateAuthUI();
    renderProfile();
    alert("Profile updated.");
  });

  document.getElementById("changePasswordBtn").addEventListener("click", function(){
    var next = document.getElementById("set-new-pw").value;
    var confirmPw = document.getElementById("set-confirm-pw").value;
    if (!next || next.length < 4) { alert("New password must be at least 4 characters."); return; }
    if (next !== confirmPw) { alert("New password and confirmation do not match."); return; }
    document.getElementById("set-current-pw").value = "";
    document.getElementById("set-new-pw").value = "";
    document.getElementById("set-confirm-pw").value = "";
    alert("Password updated (demo only — not persisted).");
  });

  document.getElementById("darkModeToggle").addEventListener("change", function(e){
    applyTheme(e.target.checked ? "dark" : "light");
  });

  function renderDashboard(){
    var grid = document.getElementById("dashboardStatsGrid");
    if (!currentUser) { grid.innerHTML = ""; return; }
    var myListings = listings.filter(function(l){ return !l.archived && l.contactEmail === currentUser.email; });
    var myOrders = listings.filter(function(l){
      return l.reservedBy && (l.reservedBy === currentUser.name || l.contactEmail === currentUser.email);
    });
    grid.innerHTML =
      statCard(myListings.length, "My listings") +
      statCard(wishlist.length, "Wishlist items") +
      statCard(favorites.length, "Favorites") +
      statCard(myOrders.length, "Orders") +
      statCard(recentlyViewed.length, "Recently viewed");
  }

  /* ================= ADMIN ================= */
  var adminStatsGrid = document.getElementById("adminStatsGrid");
  var adminPendingList = document.getElementById("adminPendingList");
  var adminReportedList = document.getElementById("adminReportedList");
  var adminArchivedList = document.getElementById("adminArchivedList");

  function statCard(value, label){
    return '<div class="stat-card"><div class="stat-value">' + value + '</div><div class="stat-label">' + label + '</div></div>';
  }
  function renderAdminStats(){
    var active = listings.filter(function(l){ return !l.archived; });
    var verifiedCount = active.filter(function(l){ return l.verified; }).length;
    var pendingCount = active.filter(function(l){ return !l.verified; }).length;
    var archivedCount = listings.filter(function(l){ return l.archived; }).length;
    var reportedCount = active.filter(function(l){ return l.reports.length > 0; }).length;
    var circulatingValue = active.filter(function(l){ return l.type === "sell" && l.price != null; })
      .reduce(function(a,l){ return a + l.price; }, 0);
    var freeCount = active.filter(function(l){ return l.type === "free"; }).length;

    adminStatsGrid.innerHTML =
      statCard(active.length, "Active listings") +
      statCard(verifiedCount, "Verified") +
      statCard(pendingCount, "Pending") +
      statCard(reportedCount, "Reported") +
      statCard(archivedCount, "Archived") +
      statCard("\u20B9" + circulatingValue, "Value circulating (sell)") +
      statCard(freeCount, "Given away free");
  }

  function renderAdmin(){
    renderAdminStats();

    var pending = listings.filter(function(l){ return !l.archived && !l.verified; });
    adminPendingList.innerHTML = pending.length
      ? pending.map(function(l){
          return (
            '<div class="admin-row">' +
              '<div><h4>' + escapeHtml(l.title) + '</h4><p class="meta-line">' + escapeHtml(l.department) + ' &middot; ' + escapeHtml(l.course) + ' &middot; ' + escapeHtml(l.semester) + ' &middot; contact: ' + escapeHtml([l.contactEmail, l.contactPhone].filter(Boolean).join(" / ")) + '</p></div>' +
              '<div class="admin-actions">' +
                '<button class="btn btn-success btn-small verify-btn" data-id="' + l.id + '">Verify</button>' +
                '<button class="btn btn-danger btn-small reject-btn" data-id="' + l.id + '">Reject</button>' +
              '</div>' +
            '</div>'
          );
        }).join("")
      : '<div class="empty-state">Nothing pending — every active listing is verified.</div>';

    var reported = listings.filter(function(l){ return !l.archived && l.reports.length > 0; });
    adminReportedList.innerHTML = reported.length
      ? reported.map(function(l){
          var reasons = l.reports.map(function(r){ return '<span class="report-reason">' + escapeHtml(r.reason) + '</span>'; }).join("");
          return (
            '<div class="admin-row">' +
              '<div><h4>' + escapeHtml(l.title) + '</h4><div>' + reasons + '</div></div>' +
              '<div class="admin-actions">' +
                '<button class="btn btn-outline btn-small dismiss-btn" data-id="' + l.id + '">Dismiss reports</button>' +
                '<button class="btn btn-danger btn-small remove-btn" data-id="' + l.id + '">Remove listing</button>' +
              '</div>' +
            '</div>'
          );
        }).join("")
      : '<div class="empty-state">No reports right now.</div>';

    var archived = listings.filter(function(l){ return l.archived; });
    adminArchivedList.innerHTML = archived.length
      ? archived.map(function(l){
          return (
            '<div class="admin-row">' +
              '<div><h4>' + escapeHtml(l.title) + '</h4><p class="meta-line">' + escapeHtml(l.semester) + '</p></div>' +
              '<div class="admin-actions"><button class="btn btn-outline btn-small restore-btn" data-id="' + l.id + '">Restore</button></div>' +
            '</div>'
          );
        }).join("")
      : '<div class="empty-state">No archived listings.</div>';

    Array.prototype.forEach.call(adminPendingList.querySelectorAll(".verify-btn"), function(btn){
      btn.addEventListener("click", function(){
        var l = listings.find(function(x){ return x.id === parseInt(btn.dataset.id,10); });
        if (l) { l.verified = true; addNotification('"' + l.title + '" was verified and is now visible to everyone.'); }
        renderAdmin(); renderBrowse();
      });
    });
    Array.prototype.forEach.call(adminPendingList.querySelectorAll(".reject-btn"), function(btn){
      btn.addEventListener("click", function(){
        var id = parseInt(btn.dataset.id,10);
        listings = listings.filter(function(x){ return x.id !== id; });
        renderAdmin(); renderBrowse();
      });
    });
    Array.prototype.forEach.call(adminReportedList.querySelectorAll(".dismiss-btn"), function(btn){
      btn.addEventListener("click", function(){
        var l = listings.find(function(x){ return x.id === parseInt(btn.dataset.id,10); });
        if (l) l.reports = [];
        renderAdmin();
      });
    });
    Array.prototype.forEach.call(adminReportedList.querySelectorAll(".remove-btn"), function(btn){
      btn.addEventListener("click", function(){
        var id = parseInt(btn.dataset.id,10);
        listings = listings.filter(function(x){ return x.id !== id; });
        renderAdmin(); renderBrowse();
      });
    });
    Array.prototype.forEach.call(adminArchivedList.querySelectorAll(".restore-btn"), function(btn){
      btn.addEventListener("click", function(){
        var l = listings.find(function(x){ return x.id === parseInt(btn.dataset.id,10); });
        if (l) l.archived = false;
        rebuildFilterOptions();
        renderAdmin(); renderBrowse();
      });
    });
  }

  document.getElementById("archiveSemesterBtn").addEventListener("click", function(){
    var semester = document.getElementById("archiveSemesterSelect").value;
    if (!semester) { alert("Choose a semester first."); return; }
    var count = 0;
    listings.forEach(function(l){
      if (!l.archived && l.semester === semester) { l.archived = true; count++; }
    });
    if (!count) { alert("No active listings found for " + semester + "."); return; }
    rebuildFilterOptions();
    renderAdmin();
    renderBrowse();
  });

  /* ================= GLOBAL ESCAPE KEY ================= */
  document.addEventListener("keydown", function(e){
    if (e.key !== "Escape") return;
    [loginBackdrop, postBackdrop, scanBackdrop, previewBackdrop, reviewBackdrop, reportBackdrop, pickupBackdrop, qrBackdrop].forEach(function(bd){
      if (!bd.classList.contains("hidden")) { if (bd === scanBackdrop) stopScan(); else closeModal(bd); }
    });
  });

  /* ================= INIT ================= */
  rebuildFilterOptions();
  updateConditionalFields();
  updateAuthUI();
  updateBellBadge();
  renderBrowse();
})();