namespace typedoc {
    function getVendorInfo(tuples: {[key: string]: string}) {
        for (const name in tuples) {
            if (!tuples.hasOwnProperty(name))
                continue;
            if (typeof ((<any>document.body.style)[name]) !== 'undefined') {
                return { name: name, endEvent: tuples[name] };
            }
        }
        return null;
    }


    export const transition = getVendorInfo({
        'transition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'msTransition': 'msTransitionEnd',
        'MozTransition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd'
    });


    export function noTransition(el: Element, callback: () => void) {
        el.classList.add('no-transition');
        callback();
        el.classList.remove('no-transition');
    }


    export function animateHeight(el: HTMLElement, callback:Function, success?:Function) {
        let from = el.clientHeight || 0;
        let to = from;
        noTransition(el, function () {
            callback();

            el.style.height = '';
            to = el.clientHeight || 0;
            if (from != to && transition) el.style.height = `${from}`;
        });

        if (from != to && transition) {
            el.style.height = `${to}`;
            const handleEndEvent = () => {
                noTransition(el, function () {
                    el.removeEventListener(transition!.endEvent, handleEndEvent);
                    el.style.height = '';
                    if (success) success();
                });
            }
            el.addEventListener(transition.endEvent, handleEndEvent);
        } else {
            if (success) success();
        }
    }
}
