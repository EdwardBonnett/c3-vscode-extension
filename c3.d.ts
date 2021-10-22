// generatedDate

declare function runOnStartup(cb: (runtime: IRuntime) => void): void;

interface IRuntime {
    objects: {
        [key:string]: IObjectClass;
        // objects
    }
    addEventListener(eventName: 'tick' | 'beforeprojectstart' | 'afterprojectstart' | 'keydown' | 'keyup'
        | 'mousedown' | 'mousemove' | 'mouseup' | 'dblclick' | 'wheel' | 'pointerdown' | 'pointermove'
        | 'pointercancel' | 'deviceorientation' | 'devicemotion' | 'save' | 'load' | 'instancecreate'
        | 'instancedestroy', callback: (...params: unknown[]) => void): void;
    removeEventListener(eventName: 'tick' | 'beforeprojectstart' | 'afterprojectstart' | 'keydown' | 'keyup'
        | 'mousedown' | 'mousemove' | 'mouseup' | 'dblclick' | 'wheel' | 'pointerdown' | 'pointermove'
        | 'pointercancel' | 'deviceorientation' | 'devicemotion' | 'save' | 'load' | 'instancecreate'
        | 'instancedestroy', callback: (...params: unknown[]) => void): void;
    dt: number;
    gameTime: number;
    getInstanceByUid(uid: any): IInstance | undefined
    globalVars: Record<string, unknown>;
    mouse?: IMouseObjectType;
    keyboard?: IKeyboardObjectType;
    touch?: ITouchObjectType;
    layout: ILayout;
    getLayout(layoutNameOrIndex: string | number): ILayout;
    getAllLayouts(): Array<ILayout>;
    goToLayout(layoutNameOrIndex: string | number): void;
    assets: IAssetManager;
    storage: IStorage;
    callFunction(name: string, ...params: unknown[]): unknown;
    setReturnValue(...params: unknown[]): void;
    projectName: string;
    projectionVersion: string;
    random(): number;
    wallTime: number;
    sortZOrder<T>(iterable: Iterable<T>, callback: (a: T, b: T) => boolean): void;
    invokeDownload(url: string, filename: string): void;
    isInWorker: boolean;
    alert(message: string): Promise<void>;
}
declare var IRuntime:  { new(): IRuntime };

interface Blob {
    readonly size: number;
    readonly type: string;
    slice(start?: number, end?: number, contentType?: string): Blob;
}

interface IAssetManager {
    fetchText(url: string): Promise<string>;
    fetchJson(url: string): Promise<unknown>;
    fetchBlob(url: string): Promise<Blob>;
    fetchArrayBuffer(url: string): Promise<ArrayBuffer>;
    getProjectFileUrl(url: string): Promise<string>;
    getMediaFileUrl(url: string): Promise<string>;
    mediaFolder: string;
    isWebMOpusSupported: boolean;
    decodeWebMOpus(audioContext: unknown, arrayBuffer: ArrayBuffer): Promise<unknown>;
    loadScripts (...urls: Array<string>): Promise<void>;
    compileWebAssembly(url: string): Promise<unknown>;
}
declare var IAssetManager:  { new(): IAssetManager };

interface IStorage {
    getItem(key: string): Promise<string>;
    setItem(key: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
}
declare var IStorage:  { new(): IStorage };

interface ILayout {
    name: string;
    index: number;
    addEventListener(eventName: 'beforelayoutstart' | 'afterlayoutstart', callback: (...params: unknown[]) => void): void;
    removeEventListener(eventName: 'beforelayoutstart' | 'afterlayoutstart', callback: (...params: unknown[]) => void): void;
    getLayer(layerNameOrIndex: string | number): ILayer;
    getAllLayers(): Array<ILayer>;
    width: number;
    height: number;
    scrollX: number;
    scrollY: number;
    scrollTo(x: number, y: number): void;
    scale: number;
    projection: 'perspective' | 'orthographic';
    setVanishingPoint(x: number, y: number): void;
    getVanishingPoint(): [number, number];
    effects: Array<IEffectInstance>;
}
declare var ILayout:  { new(): ILayout };

interface ILayer {
    name: string;
    index: number;
    layout: ILayout;
    isVisible: boolean;
    isTransparent: boolean;
    backgroundColor: [number, number, number];
    scrollX: number;
    scrollY: number;
    scrollTo(x: number, y: number): void;
    restoreScrollPosition(): void;
    parallaxX: number;
    parallaxY: number;
    opacity: number;
    scale: number;
    scaleRate: number;
    angle: number;
    zElevation: number;
    getViewport(): DOMRect;
    isForceOwnTexture: boolean;
    blendMode: 'normal' | 'additive' | 'copy' | 'destination-over' | 'source-in' | 'destination-in' | 'source-out' | 'destination-out' | 'source-atop' | 'destination-atop';
    effects: Array<IEffectInstance>;
    cssPxToLayer(clientX: number, clientY: number, z?: number): [number, number];
    layerToCssPx(clientX: number, clientY: number, z?: number): [number, number];
}
declare var ILayer:  { new(): ILayer };

interface IEffectInstance {
    index: number;
    name: string;
    isActive: boolean;
    setParamater(index: number, value: number | string | [number, number, number]): void;
    getParamater(index: number): number | string | [number, number, number];
}
declare var IEffectInstance:  { new(): IEffectInstance };

interface IMouseObjectType extends IObjectClass {
    getMouseX(layerNameOrIndex: string | number): number;
    getMouseY(layerNameOrIndex: string | number): number;
    getMousePosition(layerNameOrIndex: string | number): [number, number];
    isMouseButtonDown(button: 1 | 2 | 3): boolean;
}
declare var IMouseObjectType: undefined | { new(): IMouseObjectType };

interface IKeyboardObjectType extends IObjectClass {
    isKeyDown(keyStringOrWhich: number | string): boolean;
}

declare var IKeyboardObjectType: undefined | { new(): IKeyboardObjectType };

interface ITouchObjectType extends IObjectClass {
    requestPermission(type: string): Promise<string>;
}
declare var ITouchObjectType: undefined | { new(): ITouchObjectType };

interface IObjectClass<T = IInstance> {
    readonly name: string;
    addEventListener(eventName: 'instancecreate' | 'instancedestroy', callback: (e: Event & { instance: IInstance }) => void): void;
    removeEventListener(eventName: 'instancecreate' | 'instancedestroy', callback: (e: Event & { instance: IInstance }) => void): void;
    setInstanceClass(classType: { new(): unknown }): void;
    getAllInstances(): Array<T>
    getFirstInstance(): T | undefined
    intances(): Iterable<T>;
    getPickedInstances(): Array<T>
    getFirstPickedInstance(): T | undefined
    pickedInstances(): Iterable<T>;
    createInstance(layerNameOrIndex: string | number, x: number, y: number, createHierachy: boolean): T
}
declare var IObjectClass: { new(): IObjectClass };

// instances

interface IInstance {
    addEventListener(eventName: 'destroy', callback: (...params: unknown[]) => void): void;
    removeEventListener(eventName: 'destroy', callback: (...params: unknown[]) => void): void;
    dispatchEvent(e: Event): void;
    runtime: IRuntime;
    objectType: IObjectClass;
    instVars: Record<string, number | string | boolean | undefined | null>
    behaviors: Record<string, IBehaviorInstance>;
    readonly uid: number;
    destroy(): void;
}
declare var IInstance: { new(): IInstance };

interface I3DCameraObjectType extends IObjectClass {
    lookAtPosition(camerax: number, cameraY: number, cameraZ: number, lookX: number, lookY: number, lookZ: number, upX: number, upY: number, upZ: number): void;
    lookParallelToLayout(cameraX: number, cameraY: number, cameraZ: number, lookAngle: number): void;
    restore2DCamera(): void;
    moveAlongLayoutAxis(distance: number, axis: 'x' | 'y' | 'z', which: 'camera' | 'look' | 'both'): void;
    moveAlongCameraAxis(distance: number, axis: 'forward' | 'up' | 'right', which: 'camera' | 'look' | 'both'): void;
    getCameraPosition(): [number, number, number];
    getLookPosition(): [number, number, number];
    getForwardVector(): [number, number, number];
    getForwardVector(): [number, number, number];
    getUpVector(): [number, number, number];
    readonly zScale: number;
}

interface I3DShapeInstance extends IWorldInstance {
    shape: 'box' | 'prism' | 'wedge' | 'pyramid' | 'corner-out' | 'corner-in';
    zHeight: number;
    setFaceVisible(face: 'back' | 'front' | 'left' | 'right' | 'top' | 'bottom', visible: boolean): void;
    isFaceVisible(face: 'back' | 'front' | 'left' | 'right' | 'top' | 'bottom'): boolean;
    setFaceImage(face: 'back' | 'front' | 'left' | 'right' | 'top' | 'bottom', image: 'back' | 'front' | 'left' | 'right' | 'top' | 'bottom'): void;
    setFaceObject(face: 'back' | 'front' | 'left' | 'right' | 'top' | 'bottom', objectClass: IObjectClass): void;
    zTilingFactor: number;
    getImagePointCount(): number;
    getImagePointX(nameOrIndex: string | number): number
    getImagePointY(nameOrIndex: string | number): number
    getImagePoint(nameOrIndex: string | number): [number, number]
}
declare var I3DShapeInstance: undefined | { new(): I3DShapeInstance };

interface IArrayInstance extends IWorldInstance {
    width: number;
    height: number;
    depth: number;
    setSize(width: number, height?: number, depth?: number): void;
    getAt(x?: number, y?: number, z?: number): string | number;
    setAt(val: string | number, x: number, y?: number, z?: number): void;
}
declare var IArrayInstance: undefined | { new(): IArrayInstance };

interface IAudioObjectType extends IObjectClass {
    audioContext: AudioContext;
    destinationNode: unknown;
}
declare var IAudioObjectType: undefined | { new(): IAudioObjectType };

interface IBinaryDataInstance extends IInstance {
    setArrayBufferCopy(viewOrBuffer: ArrayBuffer | DataView): void;
    setArrayBufferTransfer(arrayBuffer: ArrayBuffer): void;
    getArrayBufferCopy(): ArrayBuffer;
    getArrayBufferReadOnly(): ArrayBuffer;
}
declare var IBinaryDataInstance: undefined | { new(): IBinaryDataInstance };

interface IButtonInstance extends IDOMInstance {
    addEventListener(eventName: 'click', callback: (...params: unknown[]) => void): void;
    text: string;
    tooltip: string;
    isEnabled: boolean;
    isChecked: false;
}
declare var IButtonInstance: undefined | { new(): IButtonInstance };

interface IDictionaryInstance extends IInstance {
    getDataMap(): Map<string, string | number>;
}
declare var IDictionaryInstance: undefined | { new(): IDictionaryInstance };

interface IDrawingCanvasInstance extends IWorldInstance {
    readonly surfaceDeviceWidth: number;    
    readonly surfaceDeviceHeight:  number;
    getImagePixelData: Promise<ImageData>;
    loadImagePixelData(imageData: ImageData, premultiplyAlpha?: boolean): void;  
}
declare var IDrawingCanvasInstance: undefined | { new(): IDrawingCanvasInstance };

interface IJsonInstance extends IInstance {
    getJsonDataCopy(): unknown;
    setJsonDataCopy(object: unknown): void;
    setJsonString(string: string): void;
    toCompactString(): string;
    toBeautifiedString(): string;
}
declare var IJsonInstance: undefined | { new(): IJsonInstance };

interface ISliderBarInstance extends IDOMInstance {
    addEventListener(eventName: 'click' | 'change', callback: (...params: unknown[]) => void): void;
    value: number;
    maximum: number;
    minimum: number;
    step: number;
    tooltip: string;
    isEnabled: boolean;
}
declare var ISliderBarInstance: undefined | { new(): ISliderBarInstance };

interface ISpriteInstance extends IWorldInstance {
    setAnimation(animationName: string, from?: 'beginning' | 'current-frame'): void;
    readonly animationName: string;
    startAnimation(from?: 'current-frame' | 'begininng'): void;
    stopAnimation(): void;
    animationFrame: number;
    animationSpeed: number;
    animationRepeatToFrame: number;
    readonly imageWidth: number;
    readonly imageHeight: number;
    getImagePointCount(): number;
    getImagePointX(nameOrIndex: string | number): number;
    getImagePointY(nameOrIndex: string | number): number;
    getImagePoint(nameOrIndex: string | number): [number | number];
    getPolyPointCount(): number;
    getPolyPointX(index: number): number;
    getPolyPointY(index: number): number;
    getPolyPoint(index: number): [number | number];
}
declare var ISpriteInstance: undefined | { new(): ISpriteInstance };

interface ISpriteFontInstance extends IWorldInstance {
    text: string;
    typewriterText(text: string, duration: number): void;
    typewriterFinish(): void;
    characterScale: number;
    characterSpacing: number;
    lineHeight: number;
    horizontalAlign: 'left' | 'center' | 'right';
    verticalAlign: 'top' | 'center' | 'bottom';
    wordWrapMode: 'word' | 'character';
}
declare var ISpriteFontInstance: undefined | { new(): ISpriteFontInstance };

interface ITextInstance extends IWorldInstance {
    text: string;
    typewriterText(text: string, duration: number): void;
    typewriterFinish(): void;
    fontColor: [number, number, number];
    fontFace: string;
    isBold: boolean;
    isItalic: boolean;
    sizePt: number;
    lineHeight: number;
    horizontalAlign: 'left' | 'center' | 'right';
    verticalAlign: 'top' | 'center' | 'bottom';
    wordWrapMode: 'word' | 'character';
    textWidth: number;
    textHeight: number;
}
declare var ITextInstance: undefined | { new(): ITextInstance };

interface ITextInputInstance extends IDOMInstance {
    addEventListener(eventName: 'click' | 'dblclick' | 'change', callback: (...params: unknown[]) => void): void;
    text: string;
    placeholder: string;
    tooltip: string;
    isEnabled: boolean;
    isReadOnly: boolean;
    scrollToBottom(): void;
    maxLength: number;
}
declare var ITextInputInstance: undefined | { new(): ITextInputInstance };

interface ITiledBackgroundInstance extends IWorldInstance {
    imageHeight: number;
    imageWidth: number;
    imageOffsetX: number;
    imageOffsetY: number;
    imageScaleX: number;
    imageScaleY: number;
    imageAngle: number;
    imageAngleDegrees: number;
}
declare var ITiledBackgroundInstance: undefined | { new(): ITiledBackgroundInstance };

interface ITilemapInstance extends IWorldInstance {
    TILE_FLIPPED_HORIZONTAL: -0x80000000;
    TILE_FLIPPED_VERTICAL: 0x40000000;
    TILE_FLIPPED_DIAGONAL: 0x20000000;
    TILE_FLAGS_MASK: 0xE0000000;
    TILE_ID_MASK: 0x1FFFFFFF;

    readonly mapWidth: number;
    readonly mapHeight: number;
    readonly mapDisplayHeight: number;
    readonly mapDisplayWidth: number;
    readonly tileWidth: number;
    readonly tileHeight: number;
    getTileAt(x: number, y: number): number;
    setTileAt(x: number, y: number, tile: number): void;
}
declare var ITilemapInstance: undefined | { new(): ITilemapInstance };

interface IDOMInstance {
    focus(): void;
    blur(): void;
    setCssStyle(prop: string, value: string): void;
    getElement(): HTMLElement;
}
declare var IDOMInstance: undefined | { new(): IDOMInstance };

interface IWorldInstance extends IInstance  {
    layout: ILayout;
    layer: ILayer;
    x: number;
    y: number;
    zElevation: number;
    readonly totalZElevation: number;
    width: number;
    height: number;
    angle: number;
    angleDegrees: number;
    getBoundingBox(): DOMRect;
    getBoundingQuad(): DOMQuad;
    isVisible: boolean;
    opacity: boolean;
    colorRgb: [number, number, number];
    blendMode: 'normal' | 'additive' | 'copy' | 'destination-over' | 'source-in' | 'destination-in' | 'source-out' | 'destination-out' | 'source-atop' | 'destination-atop';
    effects: Array<IEffectInstance>;
    moveToTop(): void;
    moveToBottom(): void;
    moveToLayer(layer: ILayer): void;
    moveAdjacentToInstance(other: IWorldInstance, isAfter: boolean): void;
    readonly zIndex: number;
    containsPoint(x: number, y: number): boolean;
    testOverlap(worldInstance: IWorldInstance): boolean;
    testOverlapSolid(): IWorldInstance | null;
    createMesh(hSize: number, vSize: number): void;
    releaseMesh(): void;
    setMeshPoint(col: number, row: number, options: { mode?: 'absolute' | 'relative', x?: number, y?: number, u?: number, v?: number, zElevation?: number}): void;
    getMeshSize(): [number, number];
    getParent(): IWorldInstance | null;
    getTopParent(): IWorldInstance | null;
    parents(): Generator<IWorldInstance>;
    getChildCount(): number;
    getChildAt(index: number): IWorldInstance | null;
    children(): Generator<IWorldInstance>;
    allChildren(): Generator<IWorldInstance>;
    addChild(worldInstance: IWorldInstance, options?: { transformX?: boolean, transformY?: boolean,transformWidth?: boolean,transformHeight?: boolean, transformAngle?: boolean,transformZElevation?: boolean,destroyWithParent?: boolean }): void;
    removeChild(worldInstance: IWorldInstance): void;
    removeFromParent(worldInstance: IWorldInstance): void;
}
declare var IWorldInstance: { new(): IWorldInstance };


interface IBehavior {
    getAllInstances: Array<IInstance>;
}
declare var IBehavior: { new(): IBehavior };

interface IBehaviorInstance {
    dispatchEvent(e: Event): void;
    instance: IInstance;
    behavior: IBehavior;
    runtime: IRuntime;
}
declare var IBehaviorInstance: { new(): IBehaviorInstance };

interface I8DirectionBehaviorInstance extends IBehaviorInstance {
    stop(): void;
    reverse(): void;
    simulateControl(control: 'left' | 'right' | 'up' | 'down'): void;
    speed: number;
    maxSpeed: number;
    acceleration: number;
    deceleration: number;
    vectorX: number;
    vectorY: number;
    isDefaultControls: boolean;
    isIgnoringInput: boolean;
    isEnabled: boolean;
}
declare var I8DirectionBehaviorInstance: undefined | { new(): I8DirectionBehaviorInstance };

interface IBulletBehaviorInstance extends IBehaviorInstance {
    speed: number;
    acceleration: number;
    gravity: number;
    angleOfMotion: number;
    bounceOffSolids: number;
    distanceTravelled: number;
    isEnabled: boolean;
}
declare var IBulletBehaviorInstance: undefined | { new(): IBulletBehaviorInstance };

interface ICarBehaviorInstance extends IBehaviorInstance {
    stop(): void;
    simulateControl(control: 'left' | 'right' | 'up' | 'down'): void;
    speed: number;
    maxSpeed: number;
    acceleration: number;
    deceleration: number;
    readonly vectorX: number;
    readonly vectorY: number;
    readonly angleOfMotion: number;
    steerSpeed: number;
    driftRecover: number;
    friction: number;
    isDefaultControls: boolean;
    isIgnoringInput: boolean;
    isEnabled: boolean;
}

declare var ICarBehaviorInstance: undefined | { new(): ICarBehaviorInstance };

interface ILOSBehaviorInstance extends IBehaviorInstance {
    range: number;
    coneOfView: number;
    hasLOStoPosition(x: number, y: number): boolean;
    hasLOSBetweenPositions(fromX: number, fromY: number, fromAngle: number, toX: number, toY: number): boolean;
    castRay(fromX: number, fromY: number, toX: number, toY: number, useCollisionCells?: boolean): ILOSBehaviorRay;
    ray: ILOSBehaviorRay;
}

declare var ILOSBehaviorInstance: undefined | { new(): ILOSBehaviorInstance };

interface ILOSBehaviorRay {
    readonly didCollide: boolean;
    readonly hitX: boolean;
    readonly hitY: boolean;
    readonly hitDistance: boolean;
    readonly hitUid: number;
    getNormalX(length: number): number;
    getNormalY(length: number): number;
    getReflectionX(length: number): number;
    getReflectionY(length: number): number;
    readonly reflectionAngle: number;
}

interface IMoveToBehaviorInstance extends IBehaviorInstance {
    addEventListener(type: 'arrived' | 'hitSolid', callback: (...params: unknown[]) => void, capture?: boolean): void;
    removeEventListener(type: 'arrived' | 'hitSolid', callback: (...params: unknown[]) => void, capture?: boolean): void;
    moveToPosition(x: number, y: number, isDirect?: boolean): void
    getTargetX(): number
    getTargetY(): number
    getTargetPosition(): [number, number]
    getWaypointCount(): number
    getWaypointX(index: number): number
    getWaypointY(index: number): number
    getWaypoint(index: number): [number, number]
    stop(): void
    readonly isMoving: boolean
    speed: number
    maxSpeed: number
    acceleration: number
    deceleration: number
    angleOfMotion: number
    rotateSpeed: number;
    isStopOnSolids: boolean;
    isEnabled: boolean;
}

declare var IMoveToBehaviorInstance: undefined | { new(): IMoveToBehaviorInstance };

interface IPathfindingBehaviorInstance extends IBehaviorInstance {
    addEventListener(type: 'arrived', callback: (...params: unknown[]) => void, capture?: boolean): void;
    removeEventListener(type: 'arrived', callback: (...params: unknown[]) => void, capture?: boolean): void;
    map: IPathfindingMap;
    findPath(x: number, y: number): Promise<boolean>;
    startMoving(): void;
    stop(): void;
    maxSpeed: number;
    speed: number;
    acceleration: number;
    deceleration: number;
    rotateSpeed: number;
    readonly isCalculatingPath: boolean;
    readonly isMoving: boolean;
    currentMode: number;
    getNodeCount(): number;
    getNodeXAt(i: number): number;
    getNodeYAt(i: number): number;
    getNodeAt(i: number): [number, number];
    isEnabled: boolean;
}

declare var IPathfindingBehaviorInstance: undefined | { new(): IPathfindingBehaviorInstance };

interface IPathfindingMap {
    isCellObstacle(x: number, y: number): boolean;
    isDiagonalsEnabled: boolean;
    regenerateMap(): Promise<void>;
    regenerateRegion(startX: number, startY: number, endX: number, endY: number): Promise<void>;
    regenerateObjectRegion(objectClass: IObjectClass): Promise<void>;
}

interface IPhysicsBehavior {
    worldGravity: boolean;
    steppingMode: 'fixed' | 'variable';
    velocityIterations: number;
    positionIterations: number;
    setCollisionsEnabled(iObjectClassA: IObjectClass, iObjectClassB: IObjectClass, state: boolean): void;
}

declare var IPhysicsBehavior: undefined | { new(): IPhysicsBehavior };

interface IPhysicsBehaviorInstance extends IBehaviorInstance {
    isEnabled: boolean;
    applyForce(forceX: number, forceY: number, imagePoint?: number): void;
    applyForceTowardPosition(force: number, x: number, y: number, imagePoint?: number): void;
    applyForceAtAngle(force: number, angle: number, imagePoint?: number): void;
    applyImpulse(impluseX: number, impluseY: number, imagePoint?: number): void;
    applyImpulseTowardPosition(impulse: number, x: number, y: number, imagePoint?: number): void;
    applyImpulseAtAngle(impulse: number, angle: number, imagePoint?: number): void;
    applyTorque(torque: number): void;
    applyTorqueToAngle(torque: number, angle: number): void;
    applyTorqueToPosition(torque: number, x: number, y: number): void;
    setVelocity(velocityX: number, velocityY: number): void;
    geVelocityX(): number;
    geVelocityY(): number;
    geVelocity(): [number, number];
    angularVelocity: number;
    isImmovable: boolean;
    isPreventRotation: boolean;
    density: number;
    friction: number;
    elasticity: number;
    linearDamping: number;
    angularDamping: number;
    isBullet: boolean;
    readonly mass: number;
    getCenterOfMassX(): number;
    getCenterOfMassY(): number;
    getCenterOfMass(): [number, number];
    readonly isSleeping: boolean;
    createDistanceJoint(imagePoint: number, otherInstance: IInstance, otherImagePoint: number, damping: number, massSpringDamperFrequency: number): void;
    createRevoluteJoint(imagePoint: number, otherInstance: IInstance): void;
    createLimitedRevoluteJoint(imagePoint: number, otherInstance: IInstance, lower: number, upper: number): void;
    createPrismaticJoint(imagePoint: number, otherInstance: IInstance, axisAngle: number, enableLimit: boolean, lowerTranslation: number, upperTranslation: number, enableMotor: boolean, motorSpeed: number, maxMotorForce: number): void;
    removeAllJoints(): void;
    getContactCount(): number;
    getContactX(index: number): number;
    getContactY(index: number): number;
    getContact(index: number): [number, number];
}

declare var IPhysicsBehaviorInstance: undefined | { new(): IPhysicsBehaviorInstance };

interface IPlatformBehaviorInstance extends IBehaviorInstance {
    fallThrough(): void;
    resetDoubleJump(allow: boolean): void;
    simulateControl(control: 'left' | 'right' | 'jump'): void;
    readonly speed: number;
    maxSpeed: number;
    acceleration: number;
    deceleration: number;
    vectorX: number;
    vectorY: number;
    jumpStength: number;
    maxFallSpeed: number;
    gravity: number;
    gravityAngle: number;
    isDoubleJumpEnabled: boolean;
    jumpSustain: number;
    readonly isMoving: boolean;
    readonly isOnFloor: boolean;
    isByWall(side: 'left' | 'right'): boolean;
    readonly isJumping: boolean;
    readonly isFalling: boolean
    ceilingCollisionMode: 'stop' | 'preserve-momentum';
    isDefaultControls: boolean;
    isIgnoringInput: boolean;
    isEnabled: boolean;
}

declare var IPlatformBehaviorInstance: undefined | { new(): IPlatformBehaviorInstance };

interface ISineBehaviorInstance extends IBehaviorInstance {
    movement: 'horizontal' | 'vertical' | 'forwards-backwards' | 'size' | 'width' | 'height' | 'angle' | 'opacity' | 'z-elevation' | 'value-only';
    wave: 'sine' | 'triangle' | 'sawtooth' | 'reverse-sawtooth' | 'square';
    period: number;
    magnitude: number;
    phase: number;
    readonly value: number;
    updateInitialState(): void;
    isEnabled: boolean;
}

declare var ISineBehaviorInstance: undefined | { new(): ISineBehaviorInstance };

interface ITileMovementBehaviourInstance extends IBehaviorInstance {
    isIgnoringInput: boolean;
    isDefaultControls: boolean;
    simulateControl(control: 'left' | 'right' | 'up' | 'down'): void;
    isEnabled: boolean;
    setSpeed(x: number, y: number): void;
    setGridPosition(x: number, y: number, immediate: boolean): void;
    getGridPosition(): [number, number];
    modifyGridDimensions(width: number, height: number, xOffset: number, yOffset: number): void;
    isMoving(): boolean;
    isMovingDirection(direction: 'left' | 'right' | 'up' | 'down'): boolean;
    canMoveTo(x: number, y: number): boolean;
    canMoveDirection(direction: 'left' | 'right' | 'up' | 'down', distance: number): boolean;
    getTargetPosition(): [number, number];
    getGridTargetPosition(): [number, number];
    toGridSpace(x: number, y: number): [number, number];
    fromGridSpace(x: number, y: number): [number, number];
}

declare var ITileMovementBehaviourInstance: undefined | { new(): ITileMovementBehaviourInstance };
