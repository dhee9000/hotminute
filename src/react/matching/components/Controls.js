import React from 'react';
import { View, Dimensions, StyleSheet, Vibration, Alert } from 'react-native';

import { Text } from '../../common/components';
import { Fonts, Colors } from '../../../config';

import Animated, { Easing } from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

import Heart from '../../../../assets/svg/pink heart.svg';
import Cross from '../../../../assets/svg/x.svg';

const {
    event,
    Value,
    Clock,
    lessThan,
    greaterThan,
    divide,
    diff,
    abs,
    block,
    startClock,
    stopClock,
    cond,
    add,
    sub,
    multiply,
    eq,
    set,
    min,
    max,
} = Animated;

const RADIUS = 100.0;

const HANDLE_EXTRA = -50.0;
const HANDLE_WIDTH = RADIUS + HANDLE_EXTRA;
const HANDLE_HEIGHT = RADIUS + HANDLE_EXTRA;
const EXTRA_OFFSET = HANDLE_EXTRA / 2;

function spring(dt, position, velocity, anchor, mass = 1, tension = 300) {
    const dist = sub(position, anchor);
    const acc = divide(multiply(-1, tension, dist), mass);
    return set(velocity, add(velocity, multiply(dt, acc)));
}

function damping(dt, velocity, mass = 1, damping = 12) {
    const acc = divide(multiply(-1, damping, velocity), mass);
    return set(velocity, add(velocity, multiply(dt, acc)));
}

const EPS = 1e-3;
const EMPTY_FRAMES_THRESHOLDS = 5;

function stopWhenNeeded(dt, position, velocity, clock) {
    const ds = diff(position);
    const noMovementFrames = new Value(0);

    return cond(
        lessThan(abs(ds), EPS),
        [
            set(noMovementFrames, add(noMovementFrames, 1)),
            cond(
                greaterThan(noMovementFrames, EMPTY_FRAMES_THRESHOLDS),
                stopClock(clock)
            ),
        ],
        set(noMovementFrames, 0)
    );
}

function interaction(gestureTranslation, gestureState) {
    const dragging = new Value(0);
    const start = new Value(0);
    const position = new Value(0);
    const anchor = new Value(0);
    const finalAnchor = new Value(0);
    const velocity = new Value(0);

    const clock = new Clock();
    const dt = divide(diff(clock), 1000);
    const currentVelocity = divide(position, dt);

    const step = cond(
        eq(gestureState, State.ACTIVE),
        [
            cond(dragging, 0, [set(dragging, 1), set(start, position)]),
            set(anchor, max(new Value(HANDLE_WIDTH-RADIUS), min(add(start, gestureTranslation), new Value(RADIUS-HANDLE_WIDTH)))),

            // attached to pan gesture "anchor"
            set(position, anchor),
        ],
        [
            set(dragging, 0),
            startClock(clock),
            spring(dt, position, velocity, 0),
            damping(dt, velocity),
        ]
    );

    return block([
        step,
        set(position, add(position, multiply(velocity, dt))),
        stopWhenNeeded(dt, position, velocity, clock),
        position,
    ]);
}

class Controls extends React.Component {

    constructor(props) {
        super(props);

        const gestureX = new Value(0);
        const gestureY = new Value(0);
        const gestureState = new Value(-1);

        

        this.onGestureEvent = event([
            {
                nativeEvent: {
                    translationX: gestureX,
                    translationY: gestureY,
                    state: gestureState,
                },
            },
        ]);

        this._transY = interaction(gestureY, gestureState);
        this._transX = interaction(gestureX, gestureState);
    }

    render() {
        if(this._transX.translationX >= RADIUS-HANDLE_WIDTH || this._transX <= HANDLE_WIDTH-RADIUS){
            Vibration.vibrate([200, 200, 200, 200]);
        }
        return (
            <View {...this.props}>
                <View style={{ backgroundColor: '#555', minWidth: RADIUS, minHeight: RADIUS, borderRadius: RADIUS / 2, justifyContent: 'center' }}>
                <PanGestureHandler onGestureEvent={this.onGestureEvent} onHandlerStateChange={this.onGestureEvent}>
                    <Animated.View style={{
                        width: HANDLE_WIDTH, height: HANDLE_HEIGHT,
                        backgroundColor: Colors.text, borderRadius: HANDLE_WIDTH / 2,
                        alignSelf: 'center',
                        transform: [{ translateX: this._transX }, { translateY: this._transY}],
                    }} />
                </PanGestureHandler>
                </View>
                {/* <View style={{position: 'absolute', alignSelf: 'center',}}>
                    <View style={{left: 100, top: -45}}>
                        <Heart width={180} height={180} />
                    </View>
                </View>
                <View style={{position: 'absolute', alignSelf: 'center',}}>
                    <View style={{left: -100, top: -45}}>
                        <Cross width={200} height={200} />
                    </View>
                </View> */}
            </View>
        )
    }
}

export default Controls;