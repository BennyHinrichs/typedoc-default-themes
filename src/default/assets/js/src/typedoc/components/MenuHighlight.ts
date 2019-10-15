/// <reference types='backbone' />
/// <reference path='../Application.ts' />
/// <reference path='../services/Viewport.ts' />

namespace typedoc
{
    /**
     * Stored element and position data of a single anchor.
     */
    interface IAnchorInfo
    {
        /**
         * The anchor tag.
         */
        anchor?: Element;

        /**
         * The link in the navigation representing this anchor.
         */
        link?: Element;

        /**
         * The vertical offset of the anchor on the page.
         */
        position: number;
    }


    /**
     * Manages the sticky state of the navigation and moves the highlight
     * to the current navigation item.
     */
    export class MenuHighlight extends Backbone.View<any>
    {
        /**
         * List of all discovered anchors.
         */
        private anchors:IAnchorInfo[] = [];

        /**
         * Index of the currently highlighted anchor.
         */
        private index:number = 0;


        /**
         * Create a new MenuHighlight instance.
         *
         * @param options  Backbone view constructor options.
         */
        constructor(options:Backbone.ViewOptions<any>) {
            super(options);

            this.listenTo(viewport, 'resize', this.onResize);
            this.listenTo(viewport, 'scroll', this.onScroll);

            this.createAnchors();
        }


        /**
         * Find all anchors on the current page.
         */
        private createAnchors() {
            this.index = 0;
            this.anchors = [{
                position: 0
            }];

            let base = window.location.href;
            if (base.indexOf('#') > -1) {
                base = base.substr(0, base.indexOf('#'));
            }

            this.el.querySelectorAll('a').forEach((el: Element) => {
                const href = (<HTMLAnchorElement>el).href;
                if (href.indexOf('#') == -1) return;
                if (href.substr(0, base.length) != base) return;

                const hash = href.substr(href.indexOf('#') + 1);
                const anchor = document.querySelector('a.tsd-anchor[name=' + hash + ']');
                if (!anchor) return;

                this.anchors.push({
                    link: el.parentElement!,
                    anchor,
                    position: 0
                });
            });

            this.onResize();
        }


        /**
         * Triggered after the viewport was resized.
         */
        private onResize() {
            let anchorInfo: IAnchorInfo;
            for (let index = 1; index < this.anchors.length; index++) {
                anchorInfo = this.anchors[index];
                anchorInfo.position = anchorInfo.anchor ? anchorInfo.anchor.getBoundingClientRect().top + html.scrollTop : 0;
            }

            this.anchors.sort((a, b) => {
                return a.position - b.position;
            });

            this.onScroll(viewport.scrollTop);
        }


        /**
         * Triggered after the viewport was scrolled.
         *
         * @param scrollTop  The current vertical scroll position.
         */
        private onScroll(scrollTop:number) {
            const anchors = this.anchors;
            let index = this.index;
            const count = anchors.length - 1;

            scrollTop += 5;
            while (index > 0 && anchors[index].position > scrollTop) {
                index -= 1;
            }

            while (index < count && anchors[index + 1].position < scrollTop) {
                index += 1;
            }

            if (this.index != index) {
                if (this.index > 0) this.anchors[this.index].link!.classList.remove('focus');
                this.index = index;
                if (this.index > 0) this.anchors[this.index].link!.classList.add('focus');
            }
        }
    }


    /**
     * Register this component.
     */
    registerComponent(MenuHighlight, '.menu-highlight');
}
