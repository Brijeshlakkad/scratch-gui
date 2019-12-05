const START_TOUR = 'scratch-gui/tour/START_TOUR';
const END_TOUR = 'scratch-gui/tour/END_TOUR';
const PAUSE_TOUR = 'scratch-gui/tour/PAUSE_TOUR';
const CONTINUE_TOUR = 'scratch-gui/tour/CONTINUE_TOUR';
const UPDATE_STEP_INDEX = 'scratch-gui/tour/UPDATE_STEP_INDEX';
const UPDATE_LATEST_BLOCK = 'scratch-gui/tour/UPDATE_LATEST_BLOCK';
const ALLOW_RUN = 'scratch-gui/tour/ALLOW_RUN';

const initialState = {
    tourAwaiting: false,
    shouldAddTour: true,
    allowToRun: false,
    run: false,
    steps: [
        {
            target: '[data-tour="first-step"]',
            content: 'This is my first Step',
            disableBeacon: true
        },
        {
            target: '[data-tour="second-step"]',
            content: 'This is my second Step',
            disableBeacon: true
        }
    ],
    latestBlock: false,
    stepIndex: 0,
}
const reducer = function (state = initialState, action) {
    switch (action.type) {
        case START_TOUR:
            if(!(state.run || state.tourAwaiting) && state.allowToRun){
                return {
                    ...state,
                    run: true
                };
            }
            return state;
        case END_TOUR:
            return {
                ...state,
                run: false
            };
        case PAUSE_TOUR:
            return {
                ...state,
                run: false,
                tourAwaiting: true
            };
        case CONTINUE_TOUR:
            return {
                ...state,
                run: true,
                tourAwaiting: false,
                stepIndex: action.stepIndex
            };
        case UPDATE_STEP_INDEX:
            return {
                ...state,
                stepIndex: action.stepIndex
            };
        case UPDATE_LATEST_BLOCK:
            return {
                ...state,
                latestBlock: action.latestBlock
            };
        case ALLOW_RUN:
            return {
                ...state,
                allowToRun: action.allowToRun
            };
        default:
            return state;

    }
};

const startTour = function () {
    return {
        type: START_TOUR
    };
};

const endTour = function () {
    return {
        type: END_TOUR
    };
};

const pauseTour = function () {
    return {
        type: PAUSE_TOUR
    };
};

const continueTour = function (index = 0) {
    return {
        type: CONTINUE_TOUR,
        stepIndex: index
    };
};

const updateStepIndex = function (index = 0) {
    return {
        type: UPDATE_STEP_INDEX,
        stepIndex: index
    }
}

const updateLatestBLock = function () {
    return {
        type: UPDATE_LATEST_BLOCK,
        latestBlock: true
    }
}

const updateAllowToRun = function (allowToRun = false) {
    return {
        type: ALLOW_RUN,
        allowToRun : allowToRun
    }
}

export {
    reducer as default,
    initialState as tourInitialState,
    startTour,
    endTour,
    pauseTour,
    continueTour,
    updateStepIndex,
    updateLatestBLock,
    updateAllowToRun
};
