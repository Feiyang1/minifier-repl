<script lang="ts">
	import Input from "./input.svelte";
	import Output from "./output.svelte";
	import firebase from "firebase/app";
	import "firebase/functions";

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

	let output = "";
	let versions = [];

	const terserVersionsCallable = firebase
		.functions()
		.httpsCallable("getTerseVersions");
	(async () => {
		const res = await terserVersionsCallable();
		versions = res.data;
	})();

	async function handleInputChange(event) {
		const input = event.detail.value;
		output = await tryToMinify(input);
		console.log(output);
	}

	async function tryToMinify(input: string): Promise<string> {
		try {
			// @ts-ignore
			const result = await Terser.minify(input, {
				toplevel: true,
			});
			console.log('input', input);
			console.log('result', result);
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

	function loadTerser(version: string): void {
		const script = document.createElement("script");
		script.type = "text/javascript";
		script.id = "terser";
		script.src = `https://unpkg.com/terser@${version}/dist/bundle.min.js`;
		document.getElementsByTagName('html')[0].appendChild(script);
	}
</script>

<style>
	.app {
		display: flex;
		flex-direction: row;
	}
</style>

<svelte:head>
	<script id="terser" src="https://unpkg.com/terser@5.3.8/dist/bundle.min.js">
	</script>
</svelte:head>
<div class="app">
	<select value={versions[versions.length - 1]} on:change={onVersionChange}>
		{#each versions as version}
			<option value={version}>{version}</option>
		{/each}
	</select>
	<Input on:value={handleInputChange} initialValue={''} />
	<Output value={output} />
</div>
