<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let value = "";
    export let title = "";

    let debounceTimer: number | undefined;
    const debounceMs = 500;
    const dispatch = createEventDispatcher();
    function onValueChanged(event) {
        if(debounceTimer) {
            clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
            dispatch("change", {
                value: event.target.value,
            });
        }, debounceMs);
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

        textarea {
            flex-grow: 1;
        }

        .textarea {
            max-height: none; // overwrite bulma limit
        }
    }
</style>

<div class="container">
    <p class="title">{title}:</p>
    <textarea
        class="textarea has-fixed-size"
        on:keyup={onValueChanged}
        bind:value />
</div>
