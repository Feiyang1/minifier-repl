<script>
    import { createEventDispatcher } from "svelte";

    export let initialValue = "";

    const dispatch = createEventDispatcher();
    function onValueChanged(event) {
        dispatch('value', {
            value: event.target.value
        });
    }
</script>

<p>input123:</p>
<textarea on:keyup={onValueChanged}>{initialValue}</textarea>
