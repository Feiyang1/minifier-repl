<script lang="ts">
	import Input from "./input.svelte";
	import Output from "./output.svelte";

	let output = "";

	async function handleInputChange(event) {
		const input = event.detail.value;
		output = await tryToMinify(input);
		console.log(output);
	}

	async function tryToMinify(input: string): Promise<string> {
		try {
			// @ts-ignore
			const result = await Terser.minify(input, {
				toplevel: true
			});
			return result.code;
		} catch (e) {
			return JSON.stringify(e);
		}
	}
</script>

<style>
	.app {
		display: flex;
		flex-direction: row;
	}
</style>

<svelte:head>
	<script src="https://unpkg.com/terser@5.3.8/dist/bundle.min.js">
	</script>
</svelte:head>
<div class="app">
	<Input on:value={handleInputChange} initialValue={''} />
	<Output value={output} />
</div>
