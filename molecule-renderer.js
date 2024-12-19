import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class MoleculeRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);  // Light gray background
        
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);
        
        this.camera.position.z = 5;
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 1);
        this.scene.add(directionalLight);

        // Initialize OrbitControls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        
        // Create color key
        this.createColorKey();
        
        this.animate = this.animate.bind(this);
        this.animate();
    }

    // Color map for different atoms with more vibrant colors
    static atomColors = {
        'H': 0xFFFFFF,  // White
        'O': 0xFF4444,  // Bright Red
        'C': 0x444444,  // Dark Grey
        'N': 0x4444FF,  // Bright Blue
        'P': 0xFFA500,  // Orange
        'S': 0xFFFF00,  // Yellow
        'Cl': 0x00FF00, // Green
        'Na': 0xAA44FF, // Purple
        'K': 0xFF44FF,  // Pink
    };

    createColorKey() {
        const keyContainer = document.createElement('div');
        keyContainer.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.9);
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            font-family: Arial, sans-serif;
            font-size: 14px;
        `;

        const title = document.createElement('div');
        title.textContent = 'Element Colors';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '5px';
        keyContainer.appendChild(title);

        Object.entries(MoleculeRenderer.atomColors).forEach(([element, color]) => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.marginBottom = '3px';

            const colorBox = document.createElement('div');
            colorBox.style.cssText = `
                width: 15px;
                height: 15px;
                background-color: #${color.toString(16).padStart(6, '0')};
                margin-right: 5px;
                border: 1px solid #ccc;
                border-radius: 3px;
            `;

            const elementName = document.createElement('span');
            elementName.textContent = element;

            row.appendChild(colorBox);
            row.appendChild(elementName);
            keyContainer.appendChild(row);
        });

        this.container.style.position = 'relative';
        this.container.appendChild(keyContainer);
    }
    
    createMolecule(structureData) {
        // Clear existing molecule
        while(this.scene.children.length > 0){ 
            this.scene.remove(this.scene.children[0]); 
        }

        // Add lights back
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 1);
        this.scene.add(directionalLight);

        // Size map for different atoms
        const atomSizes = {
            'H': 0.2,
            'O': 0.4,
            'C': 0.4,
            'N': 0.4,
            'P': 0.5,
            'S': 0.5,
            'Cl': 0.5,
            'Na': 0.5,
            'K': 0.5,
        };

        const atoms = [];
        const bonds = [];

        // Create atoms
        structureData.structure.forEach((atom, index) => {
            const color = MoleculeRenderer.atomColors[atom.symbol] || 0x808080;
            const size = atomSizes[atom.symbol] || 0.4;
            
            const geometry = new THREE.SphereGeometry(size, 32, 32);
            const material = new THREE.MeshPhongMaterial({ 
                color,
                specular: 0x444444,
                shininess: 60
            });
            const sphere = new THREE.Mesh(geometry, material);
            
            sphere.position.set(atom.x, atom.y, atom.z);
            this.scene.add(sphere);
            atoms.push(sphere);

            // Create bonds
            atom.connections.forEach(connectedIndex => {
                if (connectedIndex > index) {
                    const connectedAtom = structureData.structure[connectedIndex];
                    const start = new THREE.Vector3(atom.x, atom.y, atom.z);
                    const end = new THREE.Vector3(connectedAtom.x, connectedAtom.y, connectedAtom.z);
                    
                    const bondGeometry = new THREE.CylinderGeometry(0.1, 0.1, start.distanceTo(end), 8);
                    const bondMaterial = new THREE.MeshPhongMaterial({ 
                        color: 0x666666,
                        specular: 0x222222,
                        shininess: 30
                    });
                    const bond = new THREE.Mesh(bondGeometry, bondMaterial);
                    
                    const midpoint = start.clone().add(end).multiplyScalar(0.5);
                    bond.position.copy(midpoint);
                    bond.lookAt(end);
                    bond.rotateX(Math.PI / 2);
                    
                    this.scene.add(bond);
                    bonds.push(bond);
                }
            });
        });

        // Center the camera on the molecule
        const box = new THREE.Box3().setFromObject(this.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        this.camera.position.z = maxDim * 2;
        this.controls.target.copy(center);
        this.controls.update();
    }
    
    animate() {
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
} 