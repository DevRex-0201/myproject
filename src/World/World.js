import { loadModel } from './components/model/model.js';
import { createCamera } from './components/camera.js';
import { createLights } from './components/lights.js';
import { createScene } from './components/scene.js';
import { createControls } from './systems/controls.js';
import { createRenderer } from './systems/renderer.js';
import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js';
import { Scene,BackSide, SkeletonHelper, MeshBasicMaterial, Group, SkinnedMesh, Skeleton,Vector3,Vector4,Matrix4,Matrix3 } from 'https://cdn.skypack.dev/three@v0.132.2';
import { OBJExporter} from 'https://cdn.skypack.dev/three@v0.132.2/examples/jsm/exporters/OBJExporter.js';
import { GLTFExporter} from 'https://cdn.skypack.dev/three@v0.132.2/examples/jsm/exporters/GLTFExporter.js';


let bonenames = [
  "c_pelvis01_jj_02",
  "c_tail03_jj_04",
  "c_spine01_jj_07",
  "c_spine02_jj_08",
  "c_spine03_jj_09",
  "r_metatarsus01_jj_0109"
]

let camera;
let controls;
let renderer;
let scene;
let loop;
let bones = [];
let rotations = [];
let positions = [];
let inputx;
let inputy;
let inputz;


class World {
  constructor(container) {
    camera = createCamera();
    renderer = createRenderer(); 
    scene = createScene();
    loop = new Loop(camera, scene, renderer);
    container.append(renderer.domElement);
    controls = createControls(camera, renderer.domElement);
    const { ambientLight, mainLight1, mainLight2, mainLight3, mainLight4, mainLight5, mainLight6 } = createLights();
    loop.updatables.push(controls);
    scene.add(ambientLight, mainLight1, mainLight2, mainLight3, mainLight4, mainLight5, mainLight6);
    const resizer = new Resizer(container, camera, renderer);
    let self = this;
  }

  async init() {    

    const {modelData} = await loadModel('/assets/models/scene.gltf');
  
    const material = new MeshBasicMaterial({
      color: 0xff0000
    });

    let boneStructure;
    
    let helper;
    let bonesinittemp = []
    let bonestemp = []
    let model = modelData.scene.children[0].children[0].children[0].children[0];
    let blend_meshes = []
    let blend_shapes = []
    model.rotation.set(0, 0, 0);
    controls.target.copy(model.rotation);
    model.scale.set( 0.1, 0.1, 0.1 );    
    scene.add(model);
    model.traverse((child)=>{
      if( child.material ) {
        child.material.side = BackSide;
      }
      if(child.morphTargetDictionary )
      {
        blend_meshes.push(child.name)
      }
      
    })


    boneStructure = scene.getObjectByProperty('type', "Bone");
    boneStructure.traverse((child) =>{
        bonestemp.push(child)
    });
    for(let i=0; i < bonestemp.length; i++){
      console.log(bonestemp[i].name)
      if(bonenames.includes(bonestemp[i].name)){
        
        bones.push(bonestemp[i]);
      }
    }
    document.getElementById("joint-container").innerHTML = (bones.map((bone,index)=>(
      `<div class="joint-card">
          <div class="joint-title">${bone.name}</div>
          <div class="joint-input">
              <div class="label" for="">X</div>
              <input class="joint-input-X" type="number" step="0.05" placeholder="" value="0">
          </div>
          <div class="joint-input">
              <div class="label" for="">Y</div>
              <input class="joint-input-Y" type="number" step="0.05" placeholder="" value="0">
          </div>
          <div class="joint-input">
              <div class="label" for="">Z</div>
              <input class="joint-input-Z" type="number" step="0.05" placeholder="" value="0">
          </div>
      </div>`
    )).join(" "));
    

    
    for(let i=0; i<blend_meshes.length; i++){
      let blend_model = scene.getObjectByName(blend_meshes[i]);
      let blend = Object.keys( blend_model.morphTargetDictionary);
      for ( let j = 0; j < blend.length; j ++ ) {
        blend_shapes.push( {mesh_name:blend_meshes[i],label:blend_meshnames[i][j], blend_value : blend_model.morphTargetInfluences[j], index:j});
      }
    }
   
    document.getElementById("slider-container").innerHTML = (blend_shapes.map((blend)=>(
      `
        <div class="slider-card">
            <label>${blend.label}</label> <input class="blend-range" type="range" min=0 max =100 data=${blend.mesh_name + "," +  blend.index} value="${blend.blend_value * 50}" />
        </div>
      `
    )).join(" "))




   
    document.getElementById("export-btn").addEventListener("click", function(){
      var exporter = new OBJExporter();    
      const link = document.createElement( 'a' );
			link.style.display = 'none';
			document.body.appendChild( link ); 
      
      function save( blob, filename ) {
				link.href = URL.createObjectURL( blob );
				link.download = filename;
				link.click();
			}


      

      var v1 = new Vector3();

      scene.traverse( function ( object ) {
        
        if ( !object.isSkinnedMesh ) return;
        if ( object.geometry.isBufferGeometry !== true ) throw new Error( 'Only BufferGeometry supported.' );
        // object.skeleton.bones.forEach(bone => {
          
        //   let filtered = rotations.filter(rot=>{
        //     return rot[3]==bone.name
        //   })
        //   if(filtered.length>0)
        //   {
           
        //     // bone.rotation.x=filtered[0][0];
        //     // bone.rotation.y=filtered[0][1];
        //     // bone.rotation.z=filtered[0][2];
        //     // bone.rotation.set(0,0,0)
        //   }
        //   else{
        //     //
        //    // bone.rotation.set(0,0,0)
        //   }
        // });
        var positionAttribute = object.geometry.getAttribute( 'position' );
        var normalAttribute = object.geometry.getAttribute( 'normal' );
        for ( var j = 0; j < positionAttribute.count; j ++ ) {
          object.boneTransform(j, v1);
          positionAttribute.setXYZ(j, v1.x, v1.y, v1.z);
          getBoneNormalTransform.call(object, j, v1);
          normalAttribute.setXYZ( j, v1.x, v1.y, v1.z);
        }
        // positionAttribute.needsUpdate = true;
        // normalAttribute.needsUpdate = true;
        
      });

      inputx = document.getElementsByClassName("joint-input-X")
      inputy = document.getElementsByClassName("joint-input-Y")
      inputz = document.getElementsByClassName("joint-input-Z")
      

   
  
    })

  }

  render() {
    controls.update();
    for(let i = 0; i<inputx.length; i++ ){
      inputx[i].value = parseFloat(bones[i].rotation.x - rotations[i][0]).toFixed(2);
      inputy[i].value = parseFloat(bones[i].rotation.y - rotations[i][1]).toFixed(2);
      inputz[i].value = parseFloat(bones[i].rotation.z - rotations[i][2]).toFixed(2);
    }
    renderer.render( scene, camera );
  }

  start(){
    loop.start()
  }

  stop() {
    loop.stop();
  }
}
export { World };
