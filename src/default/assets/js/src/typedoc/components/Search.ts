/// <reference types='lunr' />

declare namespace typedoc.search
{
    interface IDocument {
        id:number;
        kind:number;
        name:string;
        url:string;
        classes:string;
        parent?:string;
    }

    interface IData {
        kinds:{[kind:number]:string};
        rows:IDocument[];
    }

    let data:IData;
}


namespace typedoc.search
{
    /**
     * Loading state definitions.
     */
    enum SearchLoadingState
    {
        Idle, Loading, Ready, Failure
    }


    /**
     * The element holding the search widget and results.
     */
    const el:HTMLElement = <HTMLElement>document.getElementById('tsd-search');

    /**
     * The input field of the search widget.
     */
    const field:HTMLInputElement = <HTMLInputElement>document.getElementById('tsd-search-field');

    /**
     * The result list wrapper.
     */
    const results:HTMLElement = <HTMLElement>document.querySelector('.results');

    /**
     * The base url that must be prepended to the indexed urls.
     */
    const base:string = el.dataset.base + '/';

    /**
     * The current query string.
     */
    let query:string = '';

    /**
     * The state the search is currently in.
     */
    let loadingState:SearchLoadingState = SearchLoadingState.Idle;

    /**
     * Is the input field focused?
     */
    let hasFocus:boolean = false;

    /**
     * Should the next key press be prevents?
     */
    let preventPress:boolean = false;

    /**
     * The lunr index used to search the documentation.
     */
    let index:lunr.Index;

    /**
     * Has a search result been clicked?
     * Used to stop the results hiding before a user can fully click on a result.
     */
    let resultClicked:boolean = false;


    /**
     * Instantiate the lunr index.
     */
    function createIndex() {
        const builder = new lunr.Builder();
        builder.pipeline.add(
            lunr.trimmer
        );

        builder.field('name', {boost:10});
        builder.field('parent');
        builder.ref('id');

        const rows = data.rows;
        let pos = 0;
        const length = rows.length;
        function batch() {
            let cycles = 0;
            while (cycles++ < 100) {
                builder.add(rows[pos]);
                if (++pos == length) {
                    index = builder.build();
                    return setLoadingState(SearchLoadingState.Ready);
                }
            }
            setTimeout(batch, 10);
        }

        batch();
    }


    /**
     * Lazy load the search index and parse it.
     */
    function loadIndex() {
        if (loadingState != SearchLoadingState.Idle) return;
        setTimeout(() => {
            if (loadingState == SearchLoadingState.Idle) {
                setLoadingState(SearchLoadingState.Loading);
            }
        }, 500);

        if (typeof data != 'undefined') {
            createIndex();
        } else {
            try {
                const source = el.dataset.index!;
                eval(source);
                createIndex();
            } catch (ex) {
                setLoadingState(SearchLoadingState.Failure);
            };
        }
    }


    /**
     * Update the visible state of the search control.
     */
    function updateResults() {
        while (results.firstElementChild) results.firstElementChild.remove();
        if (loadingState != SearchLoadingState.Ready || !query) return;

        // Perform a wildcard search
        let res = index.search(`*${query}*`);

        // If still no results, try a fuzzy match search
        if (res.length === 0) res = index.search(`*${query}~1*`);

        for (let i = 0, c = Math.min(10, res.length); i < c; i++) {
            const row = data.rows[Number(res[i].ref)];

            // Bold the matched part of the query in the search results
            let name = row.name.replace(new RegExp(query, 'i'), (match: string) => `<b>${match}</b>`);
            let parent = row.parent || '';
            parent = parent.replace(new RegExp(query, 'i'), (match: string) => `<b>${match}</b>`);

            if (parent) name = '<span class="parent">' + parent + '.</span>' + name;
            results.insertAdjacentHTML('beforeend', '<li class="' + row.classes + '"><a href="' + base + row.url + '" class="tsd-kind-icon">' + name + '</li>');
        }
    }


    /**
     * Set the loading state and update the visual state accordingly.
     */
    function setLoadingState(value:SearchLoadingState) {
        if (loadingState == value) return;

        el.classList.remove(SearchLoadingState[loadingState].toLowerCase());
        loadingState = value;
        el.classList.add(SearchLoadingState[loadingState].toLowerCase());

        if (value == SearchLoadingState.Ready) {
            updateResults();
        }
    }


    /**
     * Set the focus state and update the visual state accordingly.
     */
    function setHasFocus(value:boolean) {
        if (hasFocus == value) return;
        hasFocus = value;
        el.classList.toggle('has-focus');

        if (!value) {
            field.value = query;
        } else {
            setQuery('');
            field.value = '';
        }
    }


    /**
     * Set the query string and update the results.
     */
    function setQuery(value:string) {
        query = value.trim();
        updateResults();
    }


    /**
     * Move the highlight within the result set.
     */
    function setCurrentResult(dir:number) {
        const current = results.querySelector('.current');
        if (!current) {
            const child = results.querySelector(dir == 1 ? 'li:first-child' : 'li:last-child')!;
            child.classList.add('current');
        } else {
            const rel = dir == 1 ? current.nextElementSibling : current.previousElementSibling;
            if (rel && rel.tagName === 'LI') {
                current.classList.remove('current');
                rel.classList.add('current');
            }
        }
    }


    /**
     * Navigate to the highlighted result.
     */
    function gotoCurrentResult() {
        let current = results.querySelector('.current');

        if (current) {
            current = results.querySelector('li:first-child');
        }

        if (current) {
            window.location.href = current.querySelector('a')!.href;
            field.blur();
        }
    }

    /**
     * Intercept mousedown and mouseup events so we can correctly
     * handle clicking on search results
     */
    results.addEventListener('mousedown', () => {
        resultClicked = true;
    })
    results.addEventListener('mouseup', () => {
        resultClicked = false;
        setHasFocus(false);
    });


    /**
     * Bind all required events on the input field.
     */
    field.addEventListener('focusin', () => {
        setHasFocus(true);
        loadIndex();
    })
    field.addEventListener('focusout', () => {
        // If the user just clicked on a search result, then
        // don't lose the focus straight away, as this prevents
        // them from clicking the result and following the link
        if(resultClicked) {
            resultClicked = false;
            return;
        }

        setTimeout(() => setHasFocus(false), 100);
    })
    field.addEventListener('input', () => {
        setQuery((field.value.trim() || ''));
    })
    field.addEventListener('keydown', (e:KeyboardEvent) => {
        if (e.keyCode == 13 || e.keyCode == 27 || e.keyCode == 38 || e.keyCode == 40) {
            preventPress = true;
            e.preventDefault();

            if (e.keyCode == 13) {
                gotoCurrentResult();
            } else if (e.keyCode == 27) {
                field.blur();
            } else if (e.keyCode == 38) {
                setCurrentResult(-1);
            } else if (e.keyCode == 40) {
                setCurrentResult(1);
            }
        } else {
            preventPress = false;
        }
    })
    field.addEventListener('keypress', (e) => {
        if (preventPress) e.preventDefault();
    });


    /**
     * Start searching by pressing a key on the body.
     */
    document.body.addEventListener('keydown', (e:KeyboardEvent) => {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (!hasFocus && e.keyCode > 47 && e.keyCode < 112) field.focus();
    });
}
