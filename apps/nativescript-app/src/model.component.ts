import { ChangeDetectionStrategy, Component, ElementRef, Input, NO_ERRORS_SCHEMA, OnDestroy, OnInit } from '@angular/core';
import { NgtRenderState } from 'angular-three';
import * as THREE from 'three';
import { AnimationMixer, Clock, MathUtils } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

@Component({
  selector: 'app-model',
  standalone: true,
  template: `
    <ngt-group #group [position]="[0.06, 4.04, 0.35]" [scale]="[0.25, 0.25, 0.25]"
      (pointerover)="onPointerOver($event)" (pointerout)="onPointerOut($event)">
      <ngt-mesh *ngFor="let mesh of meshes" [geometry]="mesh.geometry" [material]="mesh.material" [name]="mesh.name"
        [castShadow]="true" [receiveShadow]="true" (beforeRender)="beforeRender($event, mesh.name)">
      </ngt-mesh>
    </ngt-group>
    <ngt-perspective-camera [fov]="28" [far]="100" [near]="0.1" [rotation]="[-PI / 2, 0, 0]"
      [position]="[-1.78, 2.04, 23.58]" (beforeRender)="animateCamera($event)">
      <ngt-directional-light [castShadow]="true" [position]="[10, 20, 15]" [intensity]="2" [shadowBias]="-0.0001"
        [shadowCameraRight]="8" [shadowCameraTop]="8" [shadowCameraLeft]="-8" [shadowCameraBottom]="-8"
        [shadowMapSizeWidth]="1024" [shadowMapSizeHeight]="1024">
      </ngt-directional-light>
    </ngt-perspective-camera>
  `,
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelComponent implements OnInit, OnDestroy {
  @Input() scroll: { current: number };
  private gltfLoader = new GLTFLoader();
  private clock = new Clock();
  private animationMixer: AnimationMixer;
  private actions: { [key: string]: THREE.AnimationAction };
  private color = new THREE.Color();
  public PI = Math.PI;
  public meshes: any[] = [];
  private hovered: string | null = null;

  constructor(private elRef: ElementRef) {}

  ngOnInit() {
    this.gltfLoader.load('/assets/model.glb', (gltf) => {
      this.meshes = gltf.scene.children[0].children;
      this.animationMixer = new AnimationMixer(gltf.scene);
      const clip = gltf.animations.find((clip) => clip.name === 'CameraAction.005');
      this.actions = {
        'CameraAction.005': this.animationMixer.clipAction(clip),
      };
      this.actions['CameraAction.005'].play().paused = true;
    });
  }

  beforeRender(state: NgtRenderState, name: string) {
    const et = this.clock.getElapsedTime();
    this.meshes.forEach((mesh, index) => {
      mesh.material.color.lerp(
        this.color.set(this.hovered === mesh.name ? 'tomato' : '#202020'),
        this.hovered ? 0.1 : 0.05
      );
      mesh.position.y = Math.sin((et + index * 2000) / 2) * 1;
      mesh.rotation.x = Math.sin((et + index * 2000) / 3) / 10;
      mesh.rotation.y = Math.cos((et + index * 2000) / 2) / 10;
      mesh.rotation.z = Math.sin((et + index * 2000) / 3) / 10;
    });

    if (this.actions && this.scroll) {
      this.actions['CameraAction.005'].time = MathUtils.lerp(
        this.actions['CameraAction.005'].time,
        this.actions['CameraAction.005'].getClip().duration * this.scroll.current,
        0.05
      );
    }
  }

  animateCamera(state: NgtRenderState) {
    this.animationMixer.update(state.delta);
  }

  onPointerOver(event: any) {
    event.stopPropagation();
    this.hovered = event.object.name;
  }

  onPointerOut(event: any) {
    event.stopPropagation();
    this.hovered = null;
  }

  ngOnDestroy() {
    this.animationMixer.stopAllAction();
  }
}
