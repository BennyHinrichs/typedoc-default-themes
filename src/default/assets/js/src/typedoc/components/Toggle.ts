/// <reference types='backbone' />
/// <reference path='../utils/pointer.ts' />
/// <reference path='../Application.ts' />

namespace typedoc
{
    /**
     * Enabled simple toggle buttons.
     */
    class Toggle extends Backbone.View<any> {
        active?: boolean;

        className!: string;

        constructor(options: Backbone.ViewOptions<any>) {
            super(options);

            this.className = this.el.dataset.toggle || '';
            this.el.addEventListener(pointerUp, (e: Event) => this.onPointerUp(e));
            this.el.addEventListener('click', (e: Event) => e.preventDefault());
            document.addEventListener(pointerDown, e => this.onDocumentPointerDown(e));
            document.addEventListener(pointerUp, e => this.onDocumentPointerUp(e));
        }

        setActive(value: boolean) {
            if (this.active == value) return;
            this.active = value;

            html.classList[value ? 'add' : 'remove']('has-' + this.className);
            this.el.classList[value ? 'add' : 'remove']('active');

            const transition = (this.active ? 'to-has-' : 'from-has-') + this.className;
            html.classList.add(transition);
            setTimeout(() => html.classList.remove(transition), 500);
        }

        onPointerUp(e: Event) {
            if (hasPointerMoved) return;
            this.setActive(true);
            e.preventDefault();
        }

        onDocumentPointerDown(e: Event) {
            if (this.active) {
                if ((<Element>e.target).closest('.col-menu, .tsd-filter-group')) return;
                this.setActive(false);
            }
        }

        onDocumentPointerUp(e: Event) {
            if (hasPointerMoved) return;
            if (this.active) {
                const colMenu = (<Element>e.target).closest('col-menu');
                if (colMenu) {
                    const link = colMenu.querySelector('a');
                    if (link) {
                        const href = window.location.origin + window.location.pathname;
                        if (link.href.substr(0, href.length) == href) {
                            setTimeout(() => this.setActive(false), 250);
                        }
                    }
                }
            }
        }
    }


    /**
     * Register this component.
     */
    registerComponent(Toggle, 'a[data-toggle]');
}
