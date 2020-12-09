<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import CodeMirror from "codemirror";
    import { clientState } from './store';
    import "codemirror/mode/javascript/javascript";

    export let value = "";
    export let title = "";

    let initialized = false;
    // init textarea with codemirror
    let textarea;
    let codeMirror;

    let debounceTimer: number | undefined;
    const debounceMs = 500;
    const dispatch = createEventDispatcher();

    onMount(() => {
        codeMirror = CodeMirror.fromTextArea(textarea, {
            lineNumbers: true,
            mode: "javascript",
        });

        codeMirror.on("change", (doc, change) => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            debounceTimer = setTimeout(() => {
                dispatch("change", {
                    value: doc.getValue(),
                });
            }, debounceMs);
        });
    });

    // only call setValue for setting the initial value, otherwise it resets the cursor position in the text editor.
    $: if (codeMirror && !initialized) {
        codeMirror.setValue(value);
        initialized = $clientState.initialized;
    }
</script>

<style lang="scss">
    // @import "bulma/bulma.sass";
    .container {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;

        .title {
            flex-grow: 0;
        }

        .textarea {
            max-height: none; // overwrite bulma limit
        }

        :global(.CodeMirror) {
            flex-grow: 1;
        }
    }
</style>

<div class="container">
    <p class="title">{title}:</p>
    <textarea bind:this={textarea} class="textarea has-fixed-size"/>
</div>
