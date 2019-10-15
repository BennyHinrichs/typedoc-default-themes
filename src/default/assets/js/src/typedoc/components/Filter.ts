/// <reference types='backbone' />
/// <reference path='../Application.ts' />
/// <reference path='../utils/pointer.ts' />

namespace typedoc
{
    abstract class FilterItem<T>
    {
        protected key:string;

        protected value:T;

        protected defaultValue:T;


        constructor(key:string, value:T) {
            this.key = key;
            this.value = value;
            this.defaultValue = value;

            this.initialize();

            if (window.localStorage[this.key]) {
                this.setValue(this.fromLocalStorage(window.localStorage[this.key]));
            }
        }


        protected initialize() {}


        protected abstract handleValueChange(oldValue:T, newValue:T): void;

        protected abstract fromLocalStorage(value: string): T;

        protected abstract toLocalStorage(value: T): string;


        protected setValue(value:T) {
            if (this.value == value) return;

            const oldValue = this.value;
            this.value = value;
            window.localStorage[this.key] = this.toLocalStorage(value);

            this.handleValueChange(oldValue, value);
        }
    }


    class FilterItemCheckbox extends FilterItem<boolean>
    {
        private checkbox!:HTMLInputElement;


        protected initialize() {
            this.checkbox = <HTMLInputElement>document.querySelector('#tsd-filter-' + this.key);
            this.checkbox.addEventListener('change', () => {
                this.setValue(this.checkbox.checked);
            });
        }


        protected handleValueChange(oldValue:boolean, newValue:boolean) {
            this.checkbox.checked =  this.value;
            html.classList.toggle('toggle-' + this.key, this.value != this.defaultValue);
        }


        protected fromLocalStorage(value:string):boolean {
            return value == 'true';
        }


        protected toLocalStorage(value:boolean):string {
            return value ? 'true' : 'false';
        }
    }


    class FilterItemSelect extends FilterItem<string>
    {
        private select!:HTMLSelectElement;


        protected initialize() {
            html.classList.add('toggle-' + this.key + this.value);

            this.select = <HTMLSelectElement>document.querySelector('#tsd-filter-' + this.key);
            this.select.addEventListener(pointerDown + ' mouseover', () => {
                this.select.classList.add('active');
            })
            this.select.addEventListener('mouseleave', () => {
                this.select.classList.remove('active');
            })
            this.select.addEventListener(pointerUp, (e) => {
                const li = (<HTMLElement>e.target).closest('li');
                if (!li) return;
                this.select.classList.remove('active');
                this.setValue((<HTMLElement>e.target).dataset.value || '');
            });

            document.addEventListener(pointerDown, (e) => {
                if ((<HTMLElement>e.target).parentElement === this.select) return;
                this.select.classList.remove('active');
            });
        }


        protected handleValueChange(oldValue:string, newValue:string) {
            const newLi = (this.select.querySelector('li[data-value="' + newValue + '"]')!);
            (this.select.querySelector('li.selected')!).classList.remove('selected');
            newLi.classList.add('selected');
            (this.select.querySelector('.tsd-select-label')!).textContent = newLi.textContent;
            html.classList.remove('toggle-' + oldValue);
            html.classList.add('toggle-' + newValue);
        }

        protected fromLocalStorage(value: string): string {
            return value;
        }

        protected toLocalStorage(value: string): string {
            return value;
        }
    }


    class Filter extends Backbone.View<any>
    {
        private optionVisibility:FilterItemSelect;

        private optionInherited:FilterItemCheckbox;

        private optionOnlyExported:FilterItemCheckbox;

        private optionExternals:FilterItemCheckbox;


        constructor(options?:Backbone.ViewOptions<any>) {
            super(options);

            this.optionVisibility   = new FilterItemSelect('visibility',      'private');
            this.optionInherited    = new FilterItemCheckbox('inherited',     true);
            this.optionExternals    = new FilterItemCheckbox('externals',     true);
            this.optionOnlyExported = new FilterItemCheckbox('only-exported', false);
        }


        static isSupported():boolean {
            try {
                return typeof window.localStorage != 'undefined';
            } catch (e) {
                return false;
            }
        }
    }


    if (Filter.isSupported()) {
        registerComponent(Filter, '#tsd-filter');
    } else {
        html.classList.add('no-filter');
    }
}
