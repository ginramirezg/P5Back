import { pokemonModel, abilitiesModel, movesModel } from "./types.ts";

export const resolvers = {
    pokemon: {
        abilities: async (
            parent: pokemonModel,
            _: unknown,
            __: unknown,
        ): Promise<abilitiesModel[]> => {
            return parent.abilities.map(ability => ({
                name: ability.name,
                url: ability.url
            }))
        },

        moves: async (
            parent: pokemonModel,
            _: unknown,
            __: unknown,
        ): Promise<movesModel[]> => {
            return parent.moves.map((elem) => ({
                name: elem.name,
                url: elem.url,
            }));
        },
    },

    abilities: {
        effect: async (
            parent: abilitiesModel,
            _: unknown,
            __: unknown,
        ): Promise<string> => {
            const response = await fetch(parent.url);

            if (!response.ok) {
                throw new Error(`Error fetching abilities: ${response.statusText}`);
            }
            const data = await response.json();
            const englishData = data.effect_entries.find((entry: { language: { name: string }; }) =>
                entry.language.name === "en"
            );
            return englishData?.effect || "Error: effects not available in English";
        },
    },

    moves: {
        power: async (
            parent: movesModel,
            _: unknown,
            __: unknown,
        ): Promise<number> => {
            const response = await fetch(parent.url);
            if (!response.ok) {
                throw new Error(`Error fetching move: ${response.statusText}`);
            }

            const data = await response.json();
            return data.power;
        }
    },

    Query: {
        pokemon: async (
            _: unknown,
            { id, name }: { id: number; name: string },
            __: unknown
        ): Promise<pokemonModel> => {
            if (id && name) {
                throw new Error("Cannot search by both id and name at the same time");
            }
            if (name) {
                name = name.toLowerCase();
            }
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id || name}`);

            if (!response.ok) {
                throw new Error(`Error finding Pokémon: ${response.statusText}`);
            }

            const data = await response.json();

            const abilities: abilitiesModel[] = data.abilities.map((elem: { ability: { name: string,  url: string }; }) => ({
                name: elem.ability.name,
                url: elem.ability.url,
            }));

            const moves: movesModel[] = data.moves.map((elem: { move: { name: string, url: string }; }) => ({
                name: elem.move.name,
                url: elem.move.url,
            }));

            return {
                id: data.id,
                name: data.name,
                abilities: abilities,
                moves: moves,
            };
        }
    }
}
