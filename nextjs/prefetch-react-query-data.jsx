import { QueryClient, dehydrate, useQuery } from '@tanstack/react-query';
import axios from 'axios';

// When you want a page to have data from a HTTP call before it is loaded, then you can use nextjs prefetch functionality
// This can work in combination with react-query by attaching the fetch to the queryKey along with react-query prefetchQuery functionality.
// Here - you will cache the result in the queryKey and when you use it in your component it will show the cached data

const fetchPokemon = () =>
    axios
        .get(`https://pokeapi.co/api/v2/pokemon`)
        .then(({ data }) => data);

export default function PokemonPage() {

    const { data, isLoading, isError } = useQuery(
        ["getPokemon"],
        () => fetchPokemon()
    );
    console.warn(pokemon)

    return (
        <div>
            {
                isLoading ? "Loading" :
                    isError ? "Error" :
                        `Data loaded ${JSON.stringify(data)}`
            }
        </div>
    );
}

export const getStaticProps = async (ctx) => {
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery(["getPokemon"], () => fetchPokemon());

    return {
        props: {
            dehydratedState: dehydrate(queryClient)
        },
    };
};
