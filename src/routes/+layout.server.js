export async function load({ locals }) {

    // Provide session from hooks.server.js to +layout.svelte (or any other component) via the `data.session` prop.

    return {
        session: locals.session,
    };
}
