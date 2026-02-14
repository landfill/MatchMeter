/**
 * MatchMeter Custom Icons
 * Style: Soft Pop Duotone (Outline + Offset Fill)
 * Replaces standard Lucide icons with a custom designed set.
 */
(function () {
    // Design System Standard:
    // 1. Outline: Stroke width 2px, Round caps/joins, Current color
    // 2. Fill: Opacity 15%, Current color (creates a soft tint of the text color)

    const outlineAttrs = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    const fillAttrs = 'fill="currentColor" opacity="0.15" stroke="none"';

    const icons = {
        // Chart Icon - Used for title and score
        'bar-chart-3': `
      <rect ${fillAttrs} x="18" y="10" width="4" height="10" rx="1" />
      <rect ${fillAttrs} x="10" y="4" width="4" height="16" rx="1" />
      <rect ${fillAttrs} x="2" y="14" width="4" height="6" rx="1" />
      <path ${outlineAttrs} d="M18 20V10"/>
      <path ${outlineAttrs} d="M12 20V4"/>
      <path ${outlineAttrs} d="M6 20v6"/>
    `,

        // Edit Icon - Used for input labels
        'edit-3': `
      <path ${fillAttrs} d="M14 6l4 4L7 21H3v-4L14 6z" />
      <path ${outlineAttrs} d="M12 5l3 3" />
      <path ${outlineAttrs} d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    `,

        // Globe Icon - Used for language toggle
        'globe': `
      <circle ${fillAttrs} cx="12" cy="12" r="10" />
      <circle ${outlineAttrs} cx="12" cy="12" r="10" />
      <path ${outlineAttrs} d="M2 12h20" />
      <path ${outlineAttrs} d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    `,

        // Heart Icon - Used for decorations
        'heart': `
      <path ${fillAttrs} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      <path ${outlineAttrs} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    `,

        // Zap Icon - Used for "lighting" effect between names
        'zap': `
      <polygon ${fillAttrs} points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      <polygon ${outlineAttrs} points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    `,

        // Check Circle - Positive feedback
        'check-circle': `
      <circle ${fillAttrs} cx="12" cy="12" r="10" />
      <path ${outlineAttrs} d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path ${outlineAttrs} d="M22 4L12 14.01l-3-3" />
    `,

        // Alert Triangle - Error/Negative feedback
        'alert-triangle': `
      <path ${fillAttrs} d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path ${outlineAttrs} d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line ${outlineAttrs} x1="12" y1="9" x2="12" y2="13" />
      <line ${outlineAttrs} x1="12" y1="17" x2="12.01" y2="17" />
    `,

        // Instagram Camera
        'camera': `
      <rect ${fillAttrs} x="2" y="6" width="20" height="14" rx="2" ry="2" />
      <path ${outlineAttrs} d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle ${outlineAttrs} cx="12" cy="13" r="4" />
    `,

        // Share Icon
        'share': `
      <circle ${fillAttrs} cx="18" cy="5" r="3" />
      <circle ${fillAttrs} cx="6" cy="12" r="3" />
      <circle ${fillAttrs} cx="18" cy="19" r="3" />
      <circle ${outlineAttrs} cx="18" cy="5" r="3" />
      <circle ${outlineAttrs} cx="6" cy="12" r="3" />
      <circle ${outlineAttrs} cx="18" cy="19" r="3" />
      <path ${outlineAttrs} d="M8.59 13.51l6.83 3.98" />
      <path ${outlineAttrs} d="M15.41 6.51l-6.82 3.98" />
    `,

        // Message Circle (Kakao)
        'message-circle': `
      <path ${fillAttrs} d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <path ${outlineAttrs} d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    `,

        // Twitter (Bird)
        'twitter': `
      <path ${fillAttrs} d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
      <path ${outlineAttrs} d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    `,

        // Facebook
        'facebook': `
      <path ${fillAttrs} d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      <path ${outlineAttrs} d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    `,

        // Link (Copy)
        'link': `
      <path ${fillAttrs} d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path ${fillAttrs} d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      <path ${outlineAttrs} d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path ${outlineAttrs} d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    `,

        // Share-2 (Used in QuickShare defaults)
        'share-2': `
      <circle ${fillAttrs} cx="18" cy="5" r="3" />
      <circle ${fillAttrs} cx="6" cy="12" r="3" />
      <circle ${fillAttrs} cx="18" cy="19" r="3" />
      <circle ${outlineAttrs} cx="18" cy="5" r="3" />
      <circle ${outlineAttrs} cx="6" cy="12" r="3" />
      <circle ${outlineAttrs} cx="18" cy="19" r="3" />
      <line ${outlineAttrs} x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line ${outlineAttrs} x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    `
    };

    /**
     * Create icons for elements with data-lucide attribute
     * @param {Object} options Configuration options
     */
    function createIcons(options = {}) {
        const root = options.root || document;
        // Select all elements with data-lucide attribute
        const elements = root.querySelectorAll('[data-lucide]');

        elements.forEach(element => {
            const name = element.getAttribute('data-lucide');
            if (icons[name]) {
                // Create SVG element
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.setAttribute('width', '24');
                svg.setAttribute('height', '24');
                svg.setAttribute('class', element.className);

                // Add specific class for our custom styling
                svg.classList.add('custom-duotone-icon');

                // Preserve other attributes (id, aria-hidden, etc.)
                Array.from(element.attributes).forEach(attr => {
                    if (attr.name !== 'class' && attr.name !== 'data-lucide') {
                        svg.setAttribute(attr.name, attr.value);
                    }
                });

                // Set inner HTML (paths)
                svg.innerHTML = icons[name];

                // Replace the placeholder element with the new SVG
                if (element.parentNode) {
                    element.parentNode.replaceChild(svg, element);
                }
            } else {
                console.warn(`Icon not found: ${name}`);
            }
        });
    }

    // Define global lucide object to maintain compatibility with existing code
    window.lucide = {
        createIcons: createIcons,
        icons: icons
    };

})();
