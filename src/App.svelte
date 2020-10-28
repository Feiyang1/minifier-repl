<script lang="ts">
	import Input from "./input.svelte";
	import Output from "./output.svelte";

	let input = '';
</script>

<style>
	.app {
		display: flex;
		flex-direction: row;
	}
</style>

<div class="app">
	<Input bind:value={input}/>
	<Output value={input} />
</div>
