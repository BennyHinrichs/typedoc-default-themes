/// <reference types='underscore' />
/// <reference path='../Application.ts' />
/// <reference path='../utils/throttle.ts' />

namespace typedoc
{
    /**
     * A global service that monitors the window size and scroll position.
     */
    export class Viewport extends Events
    {
        /**
         * The current scroll position.
         */
        scrollTop:number = 0;

        /**
         * The previous scrollTop.
         */
        lastY:number = 0;

        /**
         * The width of the window.
         */
        width:number = 0;

        /**
         * The height of the window.
         */
        height:number = 0;

        /**
         * The toolbar (contains the search input).
         */
        toolbar:HTMLDivElement;

        /**
         * Boolean indicating whether the toolbar is shown.
         */
        showToolbar:boolean = true;


        /**
         * Create new Viewport instance.
         */
        constructor() {
            super();

            this.toolbar = <HTMLDivElement>document.querySelector('.tsd-page-toolbar');

            window.addEventListener('scroll', throttle(() => this.onScroll(), 10))
            window.addEventListener('resize', throttle(() => this.onResize(), 10));

            this.onResize();
            this.onScroll();
        }


        /**
         * Trigger a resize event.
         */
        triggerResize() {
            this.trigger('resize', this.width, this.height);
        }


        /**
         * Triggered when the size of the window has changed.
         */
        onResize() {
            this.width = window.innerWidth || 0;
            this.height = window.innerHeight || 0;
            this.trigger('resize', this.width, this.height);
        }


        /**
         * Triggered when the user scrolled the viewport.
         */
        onScroll() {
            this.scrollTop = window.scrollY || 0;
            this.trigger('scroll', this.scrollTop);
            this.hideShowToolbar();
        }


        /**
         * Handle hiding/showing of the toolbar.
         */
        hideShowToolbar() {
            const isShown = this.showToolbar;
            this.showToolbar = this.lastY >= this.scrollTop || this.scrollTop === 0;
            if (isShown !== this.showToolbar) {
                this.toolbar.classList[this.showToolbar ? 'remove' : 'add']('tsd-page-toolbar--hide');
            }
            this.lastY = this.scrollTop;
        }
    }


    /**
     * Register service.
     */
    export let viewport:Viewport;
    registerService(Viewport, 'viewport');
}
