/// <reference types='backbone' />

declare namespace typedoc
{
    export interface Events extends Backbone.Events {
        new (): Events
    }
    export let Events: Backbone.Events & { new (): Backbone.Events };
}

namespace typedoc
{
    export const html = document.documentElement;


    /**
     * Service definition.
     */
    export interface IService
    {
        constructor:any;
        name:string;
        instance:any;
        priority:number;
    }


    /**
     * Component definition.
     */
    export interface IComponent
    {
        constructor:any;
        selector:string;
        priority:number;
        namespace:string;
    }


    /**
     * List of all known services.
     */
    const services:IService[] = [];

    /**
     * List of all known components.
     */
    const components:IComponent[] = [];


    /**
     * Register a new component.
     */
    export function registerService(constructor:any, name:string, priority:number = 0) {
        services.push({
            constructor: constructor,
            name:        name,
            priority:    priority,
            instance:    null
        });

        services.sort((a:IService, b:IService) => a.priority - b.priority);
    }


    /**
     * Register a new component.
     */
    export function registerComponent(constructor:any, selector:string, priority:number = 0, namespace:string = '*')
    {
        components.push({
            selector:    selector,
            constructor: constructor,
            priority:    priority,
            namespace:   namespace
        });

        components.sort((a:IComponent, b:IComponent) => a.priority - b.priority);
    }


    /**
     * Copy Backbone.Events to TypeScript class.
     */
    if (typeof Backbone != 'undefined') {
        typedoc.Events = (<any>function () {});
        for (const property in Backbone.Events) {
            if (Backbone.Events.hasOwnProperty(property)) typedoc.Events.prototype[property] = (<any>Backbone.Events)[property];
        }
    }


    /**
     * TypeDoc application class.
     */
    export class Application extends Events
    {
        /**
         * Create a new Application instance.
         */
        constructor() {
            super();

            this.createServices();
            this.createComponents(document.body);
        }


        /**
         * Create all services.
         */
        private createServices() {
            services.forEach((c) => {
                c.instance = new c.constructor();
                (<any>typedoc)[c.name] = c.instance;
            });
        }


        /**
         * Create all components beneath the given element.
         */
        public createComponents(context:HTMLElement, namespace:string = 'default'):Backbone.View<any>[] {
            const result: any[] = [];
            components.forEach(c => {
                if (c.namespace != namespace && c.namespace != '*') {
                    return;
                }
                
                context.querySelectorAll(c.selector).forEach((el:Element) => {
                    let instance;
                    if (instance = (<HTMLElement>el).dataset.component) {
                        if (result.indexOf(instance) == -1) {
                            result.push(instance);
                        }
                    } else {
                        instance = new c.constructor({el});
                        (<HTMLElement>el).dataset.component = instance;
                        result.push(instance);
                    }
                });
            });

            return result;
        }
    }
}
