import './style.css'
import * as THREE from 'three'
import { TeapotGeometry } from 'three/examples/jsm/geometries/TeapotGeometry'

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

const pointLight = new THREE.PointLight(0xffffff, 0.1)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
scene.add(camera)
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.render(scene, camera)

const clearScene = () => {
    scene.clear()
    renderer.render(scene, camera)
}
const createCube = () => {
    const texture = new THREE.TextureLoader().load('text.png');

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    renderer.render(scene, camera)
}
const createSphere = () => {
    const geometry = new THREE.SphereGeometry(1, 100, 100);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    renderer.render(scene, camera)
}
const createCone = () => {
    const geometry = new THREE.ConeGeometry(1, 4, 6);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cone = new THREE.Mesh(geometry, material);
    scene.add(cone);
    renderer.render(scene, camera)
}
const createCyn = () => {
    const geometry = new THREE.CylinderGeometry(1.0, 1.0, 2.0, 20);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cylinder = new THREE.Mesh(geometry, material);
    scene.add(cylinder);
    renderer.render(scene, camera)
}
const createTorus = () => {
    const geometry = new THREE.TorusGeometry(2, 1, 5, 7);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);
    renderer.render(scene, camera)
}
const createTeapot = () => {
    const geometry = new TeapotGeometry(1,5, true, true, true, false, true)
    const material = new THREE.MeshPhongMaterial( { color: 0x00ff00, side: THREE.DoubleSide } );
    const teapot = new THREE.Mesh(geometry, material);
    scene.add(teapot);
    renderer.render(scene, camera)
}
const getTexture = () => {
    console.log(document.getElementById("url").value)
}
document.getElementById("cube").addEventListener("click", createCube);
document.getElementById("sphere").addEventListener("click", createSphere);
document.getElementById("cone").addEventListener("click", createCone);
document.getElementById("cyn").addEventListener("click", createCyn);
document.getElementById("torus").addEventListener("click", createTorus);
document.getElementById("teapot").addEventListener("click", createTeapot);
document.getElementById("texture").addEventListener("click", getTexture);
document.getElementById("clear").addEventListener("click", clearScene);
