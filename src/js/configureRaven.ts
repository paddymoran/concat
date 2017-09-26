import * as Raven from 'raven-js';

export function prepState(state: Sign.State){
    return {routing: state.routing, user: state.user}
}

export default function configureRaven(getState : () => Sign.State ) {
   const sentryDSN = 'https://c6f6b7a97ef44e19b1f887e56a524044@sentry.io/221947';

    if (sentryDSN) {
        Raven.config(sentryDSN).install();
        Raven.setExtraContext({ state: prepState(getState()) });
    }
};
