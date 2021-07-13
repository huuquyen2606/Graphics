import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TeapotGeometry } from 'three/examples/jsm/geometries/TeapotGeometry';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'

class CustomSinCurve extends THREE.Curve {

	constructor( scale = 1 ) {

		super();

		this.scale = scale;

	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {

		const tx = t * 3 - 1.5;
		const ty = Math.sin( 2 * Math.PI * t );
		const tz = 0;

		return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );

	}

}
let scene, renderer, mesh;
let cameraPersp, cameraOrtho, currentCamera;
let textureCube;
let spotLight, lightHelper, shadowCameraHelper;
let control, orbit;
let wireMaterial, flatMaterial, gouraudMaterial, phongMaterial, texturedMaterial, reflectiveMaterial;
let boxGeo, sphereGeo, teapotGeo, torusGeo, torusKoxGeo,cylinderGeo, coneGeo, tubeGeo ;

let params = {
    loadFile : function() { 
        document.getElementById('myInput').click();
    },
    shape: 'cone',
    material: 'flat',
    modeControl: 'translate',
    color: 0xffffff,
    lx:50,
    ly:200,
    lz:50,
    animation: false,
};
// get canvas
const canvas = document.querySelector('canvas.webgl')

// add Gui
const gui = new GUI();

init();
animate();

function init() {

    // renderer

    renderer = new THREE.WebGLRenderer( { canvas: canvas,antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // group camera
    const aspect = window.innerWidth / window.innerHeight;
    cameraPersp = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    cameraOrtho = new THREE.OrthographicCamera( - 600 * aspect, 600 * aspect, 600, - 600, 0.01, 30000 );
    currentCamera = cameraPersp;

    currentCamera.position.set( 400, 200, 400 );
    currentCamera.lookAt( 0, 400, 0 );

    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xa0a0a0 );
    // scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );
    // scene.add( new THREE.GridHelper( 2000, 50, 0x888888, 0x444444 ) );

    // light
    const ambient = new THREE.AmbientLight( 0xffffff, 0.1 );
    scene.add( ambient );

    spotLight = new THREE.SpotLight( 0xffffff, 1 );
    spotLight.position.set( params.lx, params.ly, params.lz );
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.1;
    spotLight.decay = 2;
    spotLight.distance = 200;

    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 512;
    spotLight.shadow.mapSize.height = 512;
    spotLight.shadow.camera.near = 10;
    spotLight.shadow.camera.far = 600;
    spotLight.shadow.focus = 1;
    scene.add( spotLight );

    lightHelper = new THREE.SpotLightHelper( spotLight );
    scene.add( lightHelper );

    shadowCameraHelper = new THREE.CameraHelper( spotLight.shadow.camera );
    scene.add( shadowCameraHelper );

    // ground

    const ground = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x808080, dithering: true } ) );
    ground.position.set( 0, - 50, 0 );
    ground.rotation.x = - Math.PI / 2;
    ground.receiveShadow = true;
    scene.add( ground );
    
    const grid = new THREE.GridHelper( 2000, 50, 0x000000, 0x000000 );
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add( grid );

    // default object settings
    // Material 
    wireMaterial = new THREE.MeshBasicMaterial( { color: params.color, wireframe: true , dithering: true } );
    flatMaterial = new THREE.MeshPhongMaterial( { color: params.color, specular: 0x000000, flatShading: true, side: THREE.DoubleSide , dithering: true } );
    gouraudMaterial = new THREE.MeshLambertMaterial( { color: params.color, side: THREE.DoubleSide , dithering: true } );
    phongMaterial = new THREE.MeshPhongMaterial( { color: params.color, side: THREE.DoubleSide , dithering: true } );

    // TEXTURE MAP
    const textureMap = new THREE.TextureLoader().load( 'disturb.jpg' );
    textureMap.wrapS = textureMap.wrapT = THREE.RepeatWrapping;
    textureMap.anisotropy = 16;
    textureMap.encoding = THREE.sRGBEncoding;
    texturedMaterial = new THREE.MeshPhongMaterial( { color: params.color, map: textureMap, side: THREE.DoubleSide , dithering: true } );

    // REFLECTION MAP
    const path = "pisa/";
    const urls = [
        path + "px.png", path + "nx.png",
        path + "py.png", path + "ny.png",
        path + "pz.png", path + "nz.png"
    ];
    textureCube = new THREE.CubeTextureLoader().load( urls );
    textureCube.encoding = THREE.sRGBEncoding;
    reflectiveMaterial = new THREE.MeshPhongMaterial( { color: params.color, envMap: textureCube, side: THREE.DoubleSide , dithering: true } );

    // Geometry
    boxGeo = new THREE.BoxGeometry( 100, 100, 100 );
    sphereGeo = new THREE.IcosahedronGeometry( 100, 3 );
    teapotGeo = new TeapotGeometry(70, 5, true, true, true, true, true);
    torusGeo = new THREE.TorusGeometry(50, 30, 10, 50)
    cylinderGeo = new THREE.CylinderGeometry(60.0, 60.0, 140.0, 30);
    coneGeo = new THREE.ConeGeometry( 80, 160, 32 );
    torusKoxGeo = new THREE.TorusKnotGeometry( 50, 30, 32, 8 );
    const path1 = new CustomSinCurve( 80 );
    tubeGeo =  new THREE.TubeGeometry( path1, 50, 30, 8, false );

    // Box with line
    mesh = new THREE.Mesh(torusGeo, flatMaterial);
    mesh.position.y = 40;
    mesh.castShadow = true;
    scene.add(mesh);

    // controls
    orbit = new OrbitControls( currentCamera, renderer.domElement );
    orbit.update();
    orbit.addEventListener( 'change', render );

    control = new TransformControls( currentCamera, renderer.domElement );
    control.addEventListener( 'change', render );

    control.addEventListener( 'dragging-changed', function ( event ) {
        orbit.enabled = ! event.value;
    } );

    // control add mesh, scene add control
    control.attach( mesh );
    scene.add( control );

    // add GUI
    gui.add( params, 'shape', { Box: 'box', Sphere: 'sphere', TeaPot: 'teapot', Torus: 'torus', TorusKnox: 'torusKnox', Cylinder: 'cylinder', Cone :'cone', Tube: 'tube'} ).name('Shape');
    gui.add( params, 'material', { Wireframe: 'wireframe', Flat: 'flat', Smooth: 'smooth', Glossy: 'glossy' , Textured: 'textured' , Reflective: 'reflective'  } ).name('Material').onChange(function(val){
        if (val!= 'reflective'){
            ground.visible = true;
            grid.visible = true;
            scene.background = new THREE.Color( 0xa0a0a0 );
        }else{
            grid.visible = false;
            ground.visible = false;
        }
    });
    gui.add(params, 'loadFile').name('LoadImage texture');
    gui.addColor( params, 'color' ).name('Color object')
    gui.add( params, 'modeControl', {Disable: 'disable', Translate: 'translate', Rotate: 'rotate', Scale: 'scale' } ).name('Mode Control');
    const paramsLight = {
        'light color': spotLight.color.getHex(),
        intensity: spotLight.intensity,
        distance: spotLight.distance,
        angle: spotLight.angle,
        penumbra: spotLight.penumbra,
        decay: spotLight.decay,
        focus: spotLight.shadow.focus
    };
    let h = gui.addFolder('Light');
    h.addColor( paramsLight, 'light color' ).onChange( function ( val ) {
        spotLight.color.setHex( val );
        render();
    } );
    h.add( paramsLight, 'intensity', 0, 2 ).onChange( function ( val ) {
        spotLight.intensity = val;
        render();
    } );
    h.add( paramsLight, 'distance', 50, 400 ).onChange( function ( val ) {
        spotLight.distance = val;
        render();
    } );
    h.add( paramsLight, 'angle', 0, Math.PI / 3 ).onChange( function ( val ) {
        spotLight.angle = val;
        render();
    } );
    h.add( paramsLight, 'penumbra', 0, 1 ).onChange( function ( val ) {
        spotLight.penumbra = val;
        render();
    } );
    h.add( paramsLight, 'decay', 1, 2 ).onChange( function ( val ) {
        spotLight.decay = val;
        render();
    } );
    h.add( paramsLight, 'focus', 0, 1 ).onChange( function ( val ) {
        spotLight.shadow.focus = val;
        render();
    } );

    h = gui.addFolder( "Light direction" );
    h.add( params, "lx", -100, 100, 10 ).name( "x" );
    h.add( params, "ly", 0, 400, 10 ).name( "y" );
    h.add( params, "lz", -100, 100, 10 ).name( "z" );
    gui.add( params, 'animation' ).name('Animation');

    // event listener
    document.getElementById('myInput').addEventListener('change', function(){
        const file1 = document.getElementById('myInput').files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file1);
        reader.onload = function () {
            localStorage.setItem("image", reader.result);
            // TEXTURE MAP
            const textureMap1 = new THREE.TextureLoader().load( localStorage.getItem("image"));
            textureMap1.wrapS = textureMap1.wrapT = THREE.RepeatWrapping;
            textureMap1.anisotropy = 16;
            textureMap1.encoding = THREE.sRGBEncoding;
            texturedMaterial = new THREE.MeshPhongMaterial( { color: params.color, map: textureMap1, side: THREE.DoubleSide } );
        };
    })
    window.addEventListener( 'resize', onWindowResize );
    gui.domElement.addEventListener( 'change', function(){
        // control
        if(params.modeControl == 'disable'){
            control.enabled = false;
        } else{
            control.enabled = true;
            switch(params.modeControl){
                case 'translate':
                    control.setMode( 'translate' );
                    break;
                case 'rotate':
                    control.setMode( 'rotate' );
                    break;
                case 'scale':
                    control.setMode( 'scale' );
                    break;
            } 
        }
        
    },false);

}

function onWindowResize() {

    const aspect = window.innerWidth / window.innerHeight;

    cameraPersp.aspect = aspect;
    cameraPersp.updateProjectionMatrix();

    cameraOrtho.left = cameraOrtho.bottom * aspect;
    cameraOrtho.right = cameraOrtho.top * aspect;
    cameraOrtho.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}

function render() {
    lightHelper.update();
    shadowCameraHelper.update();
    renderer.render( scene, currentCamera );
}

function animate(){
    requestAnimationFrame( animate );
    simulate();
    render();
}

function box( width, height, depth ) {

    width = width * 0.5,
    height = height * 0.5,
    depth = depth * 0.5;

    const geometry = new THREE.BufferGeometry();
    const position = [];

    position.push(
        - width, - height, - depth,
        - width, height, - depth,

        - width, height, - depth,
        width, height, - depth,

        width, height, - depth,
        width, - height, - depth,

        width, - height, - depth,
        - width, - height, - depth,

        - width, - height, depth,
        - width, height, depth,

        - width, height, depth,
        width, height, depth,

        width, height, depth,
        width, - height, depth,

        width, - height, depth,
        - width, - height, depth,

        - width, - height, - depth,
        - width, - height, depth,

        - width, height, - depth,
        - width, height, depth,

        width, height, - depth,
        width, height, depth,

        width, - height, - depth,
        width, - height, depth
    );

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position, 3 ) );

    return geometry;

}

function simulate() {
    switch(params.shape){
        case 'box':
            mesh.geometry = boxGeo;
            break;
        case 'sphere':
            mesh.geometry = sphereGeo;
            break;
        case 'teapot':
            mesh.geometry = teapotGeo;
            break;
        case 'torus':
            mesh.geometry = torusGeo;
            break; 
        case 'torusKnox':
            mesh.geometry = torusKoxGeo;
            break;
        case 'cylinder':
            mesh.geometry = cylinderGeo;
            break;   
        case 'cone':
            mesh.geometry = coneGeo;
            break;  
        case 'tube':
            mesh.geometry = tubeGeo;
            break;  
    } 
    switch(params.material){
        case 'wireframe':
            mesh.material = wireMaterial;
            break;
        case 'flat':
            mesh.material = flatMaterial;
            break;
        case 'smooth':
            mesh.material = gouraudMaterial;
            break;
        case 'glossy':
            mesh.material = phongMaterial;
            break;
        case 'textured':
            mesh.material = texturedMaterial;
            break;
        case 'reflective':
            mesh.material = reflectiveMaterial;
            scene.background = textureCube;
            break;
    }   
    mesh.material.color.setHex( params.color ) ;  
    spotLight.position.set(params.lx,params.ly,params.lz);
    if (params.animation){
        const time = Date.now();
        mesh.position.x = Math.cos( time * 0.001 ) * 300;
        mesh.position.y = Math.sin( time * 0.001 ) * 30;
        mesh.position.z = Math.sin( time * 0.001 ) * 300;

        mesh.rotation.x += 0.02;
        mesh.rotation.y += 0.03;
    }else{
        mesh.position.set(0,40,0);
        mesh.rotation.x = 0;
        mesh.rotation.y = 0;
    }
}


    // // box with points
    // const amount = parseInt( window.location.search.substr( 1 ) ) || 5;
    // const count = Math.pow( amount, 3 );
    // const color = new THREE.Color(0x000000);
    // const geometry = new THREE.IcosahedronGeometry( 3, 3 );
    // const material = new THREE.MeshPhongMaterial();
    // mesh = new THREE.InstancedMesh( geometry, material, count );
    // mesh.name = 'object';
    // let i = 0;
    // const offset = ( amount - 1 ) / 2;
    // const matrix = new THREE.Matrix4();
    // for ( let x = 0; x < amount; x ++ ) {
    //     for ( let y = 0; y < amount; y ++ ) {
    //         for ( let z = 0; z < amount; z ++ ) {
    //             matrix.setPosition( (offset - x)*50, (offset - y)*50, (offset - z)*50 );
    //             mesh.setMatrixAt( i, matrix );
    //             mesh.setColorAt( i, color );
    //             i ++;
    //         }
    //     }
    // }
    // scene.add( mesh );