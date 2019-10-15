/// <reference types='backbone' />
/// <reference path='../Application.ts' />
/// <reference path='../utils/transitions.ts' />
/// <reference path='../services/Viewport.ts' />

namespace typedoc
{
    /**
     * Holds a signature and its description.
     */
    class SignatureGroup
    {
        /**
         * The target signature.
         */
        signature:HTMLElement;

        /**
         * The description for the signature.
         */
        description:HTMLElement;


        /**
         * Create a new SignatureGroup instance.
         *
         * @param signature    The target signature.
         * @param description  The description for the signature.
         */
        constructor(signature: HTMLElement, description: HTMLElement) {
            this.signature   = signature;
            this.description = description;
        }


        /**
         * Add the given class to all elements of the group.
         *
         * @param className  The class name to add.
         */
        addClass(className:string):SignatureGroup {
            const classNames = className.split(' ');
            this.signature.classList.add(...classNames);
            this.description.classList.add(...classNames);
            return this;
        }


        /**
         * Remove the given class from all elements of the group.
         *
         * @param className  The class name to remove.
         */
        removeClass(className:string):SignatureGroup {
            this.signature.classList.remove(className);
            this.description.classList.remove(className);
            return this;
        }
    }


    /**
     * Controls the tab like behaviour of methods and functions with multiple signatures.
     */
    class Signature extends Backbone.View<any>
    {
        /**
         * List of found signature groups.
         */
        private groups: SignatureGroup[] = [];

        /**
         * The container holding all the descriptions.
         */
        private container?: HTMLElement;

        /**
         * The index of the currently displayed signature.
         */
        private index:number = -1;


        /**
         * Create a new Signature instance.
         *
         * @param options  Backbone view constructor options.
         */
        constructor(options:Backbone.ViewOptions<any>) {
            super(options);

            this.createGroups();

            if (this.container) {
                this.el.classList.add('active');
                this.el.addEventListener('touchstart', (e:TouchEvent) => this.onClick(e));
                this.el.addEventListener('click', (e:MouseEvent) => this.onClick(e));
                this.container.classList.add('active');
                this.setIndex(0);
            }
        }


        /**
         * Set the index of the active signature.
         *
         * @param index  The index of the signature to activate.
         */
        private setIndex(index:number) {
            if (index < 0) index = 0;
            if (index > this.groups.length - 1) index = this.groups.length - 1;
            if (this.index == index) return;

            const to = this.groups[index];
            if (this.index > -1) {
                const from = this.groups[this.index];

                // We know $container exists because index > -1
                animateHeight(this.container!, () => {
                    from.removeClass('current').addClass('fade-out');
                    to.addClass('current fade-in');
                    viewport.triggerResize();
                });

                setTimeout(() => {
                    from.removeClass('fade-out');
                    to.removeClass('fade-in');
                }, 300);
            } else {
                to.addClass('current');
                viewport.triggerResize();
            }

            this.index = index;
        }


        /**
         * Find all signature/description groups.
         */
        private createGroups() {
            const signatures = <NodeList>this.el.querySelectorAll('.tsd-signature');
            if (signatures.length < 2) return;

            this.container = <HTMLElement>this.el.parentElement.querySelector('.tsd-descriptions');
            const descriptions = this.container.querySelectorAll('.tsd-description');

            this.groups = [];
            signatures.forEach((el, index) => {
                (<HTMLElement>el).dataset.index = `${index}`;
                this.groups.push(new SignatureGroup(<HTMLElement>el, <HTMLElement>descriptions[index]));
            });
        }


        /**
         * Triggered when the user clicks onto a signature header.
         *
         * @param e  The related event object.
         */
        private onClick(e: MouseEvent | TouchEvent) {
            const signature = (<HTMLElement>e.target).closest('.tsd-signature');
            if (signature) this.setIndex(Number((<HTMLElement>signature).dataset.index));
        }
    }


    /**
     * Register this component.
     */
    registerComponent(Signature, '.tsd-signatures');
}
