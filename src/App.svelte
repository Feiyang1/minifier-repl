<script lang="ts">
	import Input from "./input.svelte";
	import Output from "./output.svelte";
	import { clientState, getAppState, getShareState } from "./store";
	import type { OptionsState } from "./store";
	import { firebase } from "./firebase";

	import JSON5 from "json5";

	let terserLoaded = false;
	let output = "";
	let selected = $clientState.terserVersion;
	// init with the default version. All available version will be load async from npm
	let versions = [$clientState.terserVersion];

	$: (async () => {
		if (terserLoaded) {
			output = await tryToMinify(
				$clientState.input,
				$clientState.options
			);
		}
	})();

	const terserVersionsCallable = firebase
		.functions()
		.httpsCallable("getTerseVersions");
	(async () => {
		const res = await terserVersionsCallable();
		versions = res.data;
		selected = $clientState.terserVersion;
	})();

	async function handleInputChange(event) {
		const input = event.detail.value;
		clientState.setInput(input);

		// if it was a shared repl, set the flag to false on input change
		clientState.setShared(false);
	}

	async function tryToMinify(
		input: string,
		options: OptionsState
	): Promise<string> {
		if (options.error) {
			return options.error;
		}

		// @ts-ignore
		if (typeof Terser === "undefined") {
			console.log("terser has not been loaded");
			return "";
		}

		try {
			// @ts-ignore
			const result = await Terser.minify(input, options.value);
			return result.code;
		} catch (e) {
			return JSON.stringify(e);
		}
	}

	function onVersionChange(event) {
		const newVersion = event.target.value;
		clientState.setTerserVersion(newVersion);
		const currentTerserScript = document.getElementById("terser");
		if (currentTerserScript) {
			const src = currentTerserScript.getAttribute("src");

			const regex = /unpkg.com\/terser@(\d+\.\d+\.\d+)\//;
			const match = regex.exec(src);

			if (match) {
				const currentVersion = match[1];
				// load the selected version of terser if the current version is different
				if (currentVersion !== newVersion) {
					// remove the current script tag, then insert a new script tag
					currentTerserScript.remove();
					loadTerser(newVersion);
				}
			}
		} else {
			// create a script tag
			loadTerser(newVersion);
		}
	}

	// TODO: disable the app while the script is loading
	// TODO: run minify with the new verion once it's loaded
	function loadTerser(version: string): void {
		const script = document.createElement("script");
		script.type = "text/javascript";
		script.id = "terser";
		script.src = `https://unpkg.com/terser@${version}/dist/bundle.min.js`;
		document.getElementsByTagName("html")[0].appendChild(script);
	}

	async function handleOptionChange(event) {
		try {
			clientState.setOptions({
				value: JSON5.parse(event.detail.value),
				rawString: event.detail.value,
			});
		} catch (e) {
			clientState.setOptions({
				value: {},
				rawString: event.detail.value,
				error: `options is not a valid JSON. Error: ${e}`,
			});
		}

		// if it was a shared repl, set the flag to false on config change
		clientState.setShared(false);
	}

	function onTerserLoad() {
		terserLoaded = true;
	}

	async function onShare() {
		console.log("share the repl page");
		const firestore = firebase.firestore();
		const docRef = await firestore
			.collection("shared")
			.add(getShareState($clientState));
		clientState.setShared(true, docRef.id);
	}
</script>

<style lang="scss">
	// @import "bulma/bulma.sass";
	.app {
		padding: 0.5rem;
	}

	.columns {
		height: 100%;
		min-height: 800px;
	}

	.right {
		display: flex;
		flex-direction: column;

		.output {
			flex-grow: 2;
		}

		.config {
			flex-grow: 1;
		}
	}

	:global(body) {
		padding: 0.5 rem;
	}
</style>

<svelte:head>
	<script
		id="terser"
		src="https://unpkg.com/terser@5.3.8/dist/bundle.min.js"
		on:load={onTerserLoad}>
	</script>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/bulma@0.9.1/css/bulma.min.css" />
</svelte:head>
<div class="app">
	<nav class="level">
		<!-- Left side -->
		<div class="level-left">
			<div class="level-item">
				<p class="subtitle is-5">Terser REPL</p>
			</div>
			<div class="level-item">
				<div class="field has-addons">
					<p class="control">
						<select value={selected} on:change={onVersionChange}>
							{#each versions as version}
								<option value={version}>{version}</option>
							{/each}
						</select>
					</p>
				</div>
			</div>
		</div>

		<!-- Right side -->
		<div class="level-right">
			{#if !$clientState.shared}
				<p class="level-item" on:click={onShare}><a>Share</a></p>
			{:else}
				<p class="level-item">
					<a>{location.origin}/{$clientState.shareId}</a>
				</p>
			{/if}
			<p class="level-item"><a>Configuration</a></p>
		</div>
	</nav>

	<div class="columns">
		<div class="column">
			<Input
				on:change={handleInputChange}
				value={$clientState.input}
				title="input" />
		</div>
		<div class="column right">
			<div class="output">
				<Output value={output} title="output" />
			</div>
			<div class="config">
				<Input
					on:change={handleOptionChange}
					value={$clientState.options.rawString}
					title="config" />
			</div>
		</div>
	</div>
</div>
