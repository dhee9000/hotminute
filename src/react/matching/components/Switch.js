import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';

import { Text } from '../../common/components';
import { Fonts, Colors } from '../../../config';

import Animated, { Easing } from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const {
    color,
    Extrapolate,
    interpolate,
    event,
    Value,
    Clock,
    lessThan,
    greaterThan,
    round,
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

const WIDTH = 64.0;
const HEIGHT = 24.0;

const HANDLE_EXTRA = 8.0;
const HANDLE_WIDTH = HEIGHT + HANDLE_EXTRA;
const HANDLE_HEIGHT = HEIGHT + HANDLE_EXTRA;
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
            set(anchor, max(new Value(0), min(add(start, gestureTranslation), new Value(WIDTH-HANDLE_WIDTH + EXTRA_OFFSET)))),

            // attached to pan gesture "anchor"
            set(position, anchor),
            cond(
                greaterThan(position, (WIDTH-HANDLE_WIDTH)/2), 
                set(finalAnchor, WIDTH-HANDLE_WIDTH + EXTRA_OFFSET), 
                set(finalAnchor, 0)
            ), 
        ],
        [
            set(dragging, 0),
            startClock(clock),
            spring(dt, position, velocity, finalAnchor),
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

const colorRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

const hexToRgb = (hex) => {
  const result = colorRegex.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const white = { r: 255, g: 255, b: 255 };

export const interpolateColors = (
  animationValue,
  inputRange,
  hexColors,
) => {
  const colors = hexColors.map(hexColor => hexToRgb(hexColor) || white);
  const r = round(
    interpolate(animationValue, {
      inputRange,
      outputRange: colors.map(c => c.r),
      extrapolate: Extrapolate.CLAMP,
    }),
  );
  const g = round(
    interpolate(animationValue, {
      inputRange,
      outputRange: colors.map(c => c.g),
      extrapolate: Extrapolate.CLAMP,
    }),
  );
  const b = round(
    interpolate(animationValue, {
      inputRange,
      outputRange: colors.map(c => c.b),
      extrapolate: Extrapolate.CLAMP,
    }),
  );
  return color(r, g, b);
};

class Switch extends React.Component {

    constructor(props) {
        super(props);

        const gestureX = new Value(0);
        const state = new Value(-1);

        this.onGestureEvent = event([
            {
                nativeEvent: {
                    translationX: gestureX,
                    state: state,
                },
            },
        ]);

        this._transX = interaction(gestureX, state);
    }

    render() {
        return (
            <View {...this.props}>
                <View style={{ backgroundColor: Colors.background, width: WIDTH, height: HEIGHT, borderRadius: WIDTH / 2 }} />
                <PanGestureHandler onGestureEvent={this.onGestureEvent} onHandlerStateChange={this.onGestureEvent}>
                    <Animated.View style={{
                        width: HANDLE_WIDTH, height: HANDLE_HEIGHT,
                        backgroundColor: interpolateColors(this._transX, [0, WIDTH-HANDLE_WIDTH], [Colors.primaryDark, Colors.primary]),
                        borderRadius: HANDLE_WIDTH / 2,
                        position: 'absolute', left: -EXTRA_OFFSET, top: -EXTRA_OFFSET,
                        transform: [{ translateX: this._transX }],
                    }} />
                </PanGestureHandler>
            </View>
        )
    }
}

export default Switch;