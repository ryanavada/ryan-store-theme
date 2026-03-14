if (!customElements.get('x-collection-showcase')) {
  class CollectionsShowcase extends HTMLElement {
    constructor() {
      super();
      this.selectors = {
        images: ['.x-collection-showcase__image'],
        tabs: ['.x-collection-showcase__tabs-list a'],
        contents: ['.x-collection-showcase__content'],
        banner: '.x-collection-showcase__banner',
        contentsWrapper: '.x-collection-showcase__contents'
      };
    }

    init() {
      this.domNodes = window.Foxify.Utils.queryDomNodes(this.selectors, this);
      this.trigger = this.dataset.trigger || 'click';
      this.activeIndex = 0;
      this.canHover = window.matchMedia('(hover: hover)').matches;
      
      this.initEventListeners();
      this.setActiveTab(0);
      this.setSectionPaddingOffset();
    }

    setSectionPaddingOffset() {
      const section = this.closest('.x-section');
      
      if (section && this.domNodes.contentsWrapper) {
        const sectionStyles = window.getComputedStyle(section);
        const paddingRight = sectionStyles.paddingRight;
        this.domNodes.contentsWrapper.style.setProperty('--x-offset', paddingRight);
      }
    }

    initResizeObserver() {
      this.resizeObserver = new ResizeObserver(() => {
        this.setSectionPaddingOffset();
      });

      const section = this.closest('.x-section');
      if (section) {
        this.resizeObserver.observe(section);
      }
    }

    initEventListeners() {
      if (this.trigger === 'hover' && this.canHover) {
        this.domNodes.tabs.forEach((tab, index) => {
          tab.addEventListener('mouseenter', () => this.setActiveTab(index));
        });
      } else {
        this.domNodes.tabs.forEach((tab, index) => {
          tab.addEventListener('click', (e) => {
            e.preventDefault();
            this.setActiveTab(index);
          });
        });
      }

      this.domNodes.tabs.forEach((tab, index) => {
        tab.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.setActiveTab(index);
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = index > 0 ? index - 1 : this.domNodes.tabs.length - 1;
            this.setActiveTab(prevIndex);
            this.domNodes.tabs[prevIndex].focus();
          } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = index < this.domNodes.tabs.length - 1 ? index + 1 : 0;
            this.setActiveTab(nextIndex);
            this.domNodes.tabs[nextIndex].focus();
          } else if (e.key === 'Home') {
            e.preventDefault();
            this.setActiveTab(0);
            this.domNodes.tabs[0].focus();
          } else if (e.key === 'End') {
            e.preventDefault();
            const lastIndex = this.domNodes.tabs.length - 1;
            this.setActiveTab(lastIndex);
            this.domNodes.tabs[lastIndex].focus();
          }
        });
      });
    }

    setActiveTab(index) {
      if (index === this.activeIndex) return;

      this.activeIndex = index;

      this.domNodes.images.forEach((image, imageIndex) => {
        if (imageIndex === index) {
          image.classList.add('active');
        } else {
          image.classList.remove('active');
        }
      });

      this.domNodes.tabs.forEach((tab, tabIndex) => {
        if (tabIndex === index) {
          tab.classList.add('active');
          tab.setAttribute('aria-selected', 'true');
          tab.setAttribute('tabindex', '0');
        } else {
          tab.classList.remove('active');
          tab.setAttribute('aria-selected', 'false');
          tab.setAttribute('tabindex', '-1');
        }
      });

      this.domNodes.contents.forEach((content, contentIndex) => {
        if (contentIndex === index) {
          content.classList.add('active');
          content.removeAttribute('hidden');
        } else {
          content.classList.remove('active');
          content.setAttribute('hidden', '');
        }
      });

      this.dispatchEvent(new CustomEvent('collectionShowcaseChange', {
        bubbles: true,
        detail: { 
          activeIndex: index,
          activeTab: this.domNodes.tabs[index],
          activeContent: this.domNodes.contents[index]
        }
      }));
    }

    connectedCallback() {
      this.init();
      this.initResizeObserver();
    }

    disconnectedCallback() {
      this.domNodes.tabs.forEach(tab => {
        tab.removeEventListener('click', this.handleClick);
        tab.removeEventListener('mouseenter', this.handleMouseEnter);
        tab.removeEventListener('keydown', this.handleKeyDown);
      });
      
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
    }
  }

  customElements.define('x-collection-showcase', CollectionsShowcase);
}
