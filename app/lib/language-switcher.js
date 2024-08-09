//   document.addEventListener("DOMContentLoaded", function() {
//     const dropdownToggle = document.getElementById("dropdownToggle");
//     const dropdownMenu = document.getElementById("dropdownMenu");
//     const dropdownItems = document.querySelectorAll(".dropdown-item");
  
//     if (!dropdownToggle || !dropdownMenu || !dropdownItems.length) {
//         console.error("Dropdown elements not found");
//         return;
//     }
  
//     dropdownToggle.addEventListener("click", function(event) {
//         console.log("Dropdown toggle clicked");
//         dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
//         dropdownToggle.classList.toggle("active");
//     });
  
//     dropdownItems.forEach(item => {
//         item.addEventListener("click", function(event) {
//             console.log("Dropdown item clicked:", this.textContent);
//             dropdownToggle.textContent = this.textContent;
//             dropdownToggle.setAttribute("data-value", this.getAttribute("data-value"));
//             dropdownMenu.style.display = "none";
  
//             const currentUrl = window.location.href;
//             const baseUrl = window.location.origin;
//             const pathName = window.location.pathname;
//             const pathSegments = pathName.split('/').filter(segment => segment.length > 0);
//             const selectedLanguage = this.getAttribute("data-value");
  
//             let newUrl;
//             const languageCodes = ["de-de", "en-de"];
//             let containsLanguageCode = false;
  
//             for (let i = 0; i < pathSegments.length; i++) {
//                 if (languageCodes.includes(pathSegments[i])) {
//                     pathSegments[i] = selectedLanguage;
//                     containsLanguageCode = true;
//                     break;
//                 }
//             }
//             if (!containsLanguageCode) {
//                 pathSegments.unshift(selectedLanguage);
//             }
  
//             newUrl = `${baseUrl}/${pathSegments.join('/')}`;
  
//             window.location.href = newUrl;
//         });
//     });
  
//     document.addEventListener("click", function(event) {
//         if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
//             dropdownMenu.style.display = "none";
//         }
//     });
//   });
  

//   document.addEventListener("DOMContentLoaded", function() {
  
//     if (window.location.href.indexOf('en-de') !== -1) {
//         setTimeout(function() {  
//         dropdownToggle.textContent = 'EN';
//         }, 200);
//         const links = document.querySelectorAll('a[href*="/en"]');
//         links.forEach(link => {
//             const newHref = link.href.replace('/en', '/en-de');
//             link.setAttribute('data-new-href', newHref);
//             link.addEventListener('click', function(event) {
//                 event.preventDefault(); 
//                 window.location.href = newHref; 
//             });
//         });
//     }
  
//     else if (window.location.href.indexOf('de-de') !== -1) {
//         setTimeout(function() {  
//         dropdownToggle.textContent = 'DE';
//         }, 200);
//         const links = document.querySelectorAll('a[href]');
//         links.forEach(link => {
//             if (link.href.indexOf('/de-de') === -1 && link.href.indexOf('/en') === -1) {
//                 const newHref = link.href.replace(window.location.origin, window.location.origin + '/de-de');
//                 link.setAttribute('data-new-href', newHref);
//                 link.addEventListener('click', function(event) {
//                     event.preventDefault();
//                     window.location.href = newHref; 
//                 });
//             }
//         });
//     }
    
//     else {
//         setTimeout(function() {  
//         dropdownToggle.textContent = 'DE';
//         }, 200);
//         const newUrl = window.location.href.replace(window.location.origin, window.location.origin + '/de-de');
//         window.history.replaceState(null, '', newUrl);
//         const links = document.querySelectorAll('a[href]');
//         links.forEach(link => {
//             if (link.href.indexOf('/de-de') === -1 && link.href.indexOf('/en') === -1) {
//                 const newHref = link.href.replace(window.location.origin, window.location.origin + '/de-de');
//                 link.setAttribute('data-new-href', newHref);
//                 link.addEventListener('click', function(event) {
//                     event.preventDefault();
//                     window.location.href = newHref;
//                 });
//             }
//         });
//     }
// });

// // url replace