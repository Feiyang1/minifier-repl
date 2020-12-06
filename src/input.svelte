<script>
    import { createEventDispatcher } from "svelte";

    export let value = "";
    export let title = "";

    const dispatch = createEventDispatcher();
    function onValueChanged(event) {
        dispatch('change', {
            value: event.target.value
        });
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
    <textarea class="textarea has-fixed-size" on:keyup={onValueChanged} bind:value={value}></textarea>
</div>
