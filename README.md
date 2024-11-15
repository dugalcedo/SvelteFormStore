# svelte-form-store

A Svelte 5 store for sanitizing and validating forms.

## Example

```svelte
<script lang="ts">
    import FormStore from "./SvelteFormStore/FormStore.svelte";

    type TravelFormState = {
        name: string
        cities: {
            name: string
            nOfNights: number
        }[]
    }

    const initialState: TravelFormState = {
        name: "My trip",
        cities: []
    }


    const fs = new FormStore<TravelFormState>({
        initialState,
        sanitizer(data) {
            return {
                ...data,
                name: FormStore.sanitizeString(data.name),
                cities: data.cities.map(c => ({...c, name: FormStore.sanitizeString(c.name)}))
            }
        },
        validator(sanitized, err) {
            console.log(sanitized)
            if (!sanitized.name) err("name", "required");
            fs.checkUnique(sanitized.cities, "name", ([i], [city]) => {
                err(`city-${i}`, "must be unique")
            })
            sanitized.cities.forEach((c, i) => {
                if (!c.name) err(`city-${i}`, "required")
            })
        }
    })

    function addCity() {
        fs.state.cities.push({
            name: "",
            nOfNights: 1
        })
    }

</script>

<form>
    <div class="field">
        <label for="form-name">Name</label>
        <input type="text" id="form-name" bind:value={fs.state.name}>
        <span class="error">{fs.errors.name||""}</span>
    </div>
    <fieldset>
        <h3>Cities</h3>
        <button onclick={addCity} type="button">
            +
        </button>
        {#each fs.state.cities as city, i (i)}
            <div class="field">
                <label for="form-city-${i}">city name</label>
                <input type="text" id="form-city-${i}" bind:value={city.name}>
                <span class="error">{fs.errors[`city-${i}`]||""}</span>
            </div>
            <div class="field">
                <label for="form-city-nights-${i}">number of nights</label>
                <input type="number" min="1" id="form-city-nights-${i}" bind:value={city.nOfNights}>
            </div>
        {/each}
    </fieldset>
</form>
```

## API

### FormStore

- Takes 1-2 generics: FormStoreType and Sanitized (defaults to FormStoreType)

#### Instance properties

- FormStore.prototype.state

type is FormStoreType (Svelte 5 state)

- FormStore.prototype.sanitized

type is Sanitized (Svelte 5 state)

- FormStore.prototype.errors

type is Map&lt;string, string&gt;

#### Instance methods

- FormStore.prototype.errMsg(key: string): string

gets value from FormStore.prototype.errors but defaults to string if not found

- FormStore.prototype.checkUnique(arr: any[], key: string, onMatch: MatchHandler)

makes it easier to check for non-unique values
