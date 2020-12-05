<script lang="ts">
	import Input from "./input.svelte";
	import Output from "./output.svelte";
	import firebase from "firebase/app";
	import "firebase/functions";
	import JSON5 from 'json5';

	firebase.initializeApp({
		apiKey: "AIzaSyAeDajuxjFKAYQAl3JWsPGV5KdCa28OLRk",
		authDomain: "minifier-repl.firebaseapp.com",
		databaseURL: "https://minifier-repl.firebaseio.com",
		projectId: "minifier-repl",
		storageBucket: "minifier-repl.appspot.com",
		messagingSenderId: "977703229010",
		appId: "1:977703229010:web:9f00db839d754fe190f18b",
		measurementId: "G-LV8CS7FRKZ",
	});

	interface OptionsState {
		error?: string;
		value: Record<string, unknown>;
	}

	let output = "";
	let input = "";
	let options: OptionsState = {
		value: {},
	};
	let versions = [];

	const terserVersionsCallable = firebase
		.functions()
		.httpsCallable("getTerseVersions");
	(async () => {
		const res = await terserVersionsCallable();
		versions = res.data;
	})();

	async function handleInputChange(event) {
		input = event.detail.value;
		output = await tryToMinify(input, options);
		console.log(output);
	}

	async function tryToMinify(
		input: string,
		options: OptionsState
	): Promise<string> {
		if (options.error) {
			return options.error;
		}

		try {
			// @ts-ignore
			const result = await Terser.minify(input, options.value);
			console.log("input", input, options);
			console.log("result", result);
			return result.code;
		} catch (e) {
			return JSON.stringify(e);
		}
	}

	function onVersionChange(event) {
		const newVersion = event.target.value;
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
			options.value = JSON5.parse(event.detail.value);
			options.error = undefined;
		} catch (e) {
			options.error = `options is not a valid JSON. Error: ${e}`;
		}

		if (
			typeof options !== "object" ||
			options === null ||
			Array.isArray(options)
		) {
			options.error = `options should be an object, but it is ${options}`;
		}

		output = await tryToMinify(input, options);
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
	<script id="terser" src="https://unpkg.com/terser@5.3.8/dist/bundle.min.js"></script>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.1/css/bulma.min.css">
</svelte:head>

<div class="app">
	<nav class="level">
		<!-- Left side -->
		<div class="level-left">
		<div class="level-item">
			<p class="subtitle is-5">
			Terser REPL
			</p>
		</div>
		<div class="level-item">
			<div class="field has-addons">
			<p class="control">
				<select value={versions[versions.length - 1]} on:change={onVersionChange}>
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
		<p class="level-item"><a>Configuration</a></p>
		</div>
	</nav>

	<div class="columns">
		<div class="column">
			<Input on:value={handleInputChange} initialValue={''} title="input"/>
		</div>
		<div class="column right">
			<div class="output">
				<Output value={output} title="output"/>
			</div>
			<div class="config">
				<Input on:value={handleOptionChange} initialValue={'{}'} title="config"/>
			</div>
		</div>
	</div>
</div>


