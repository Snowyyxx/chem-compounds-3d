import { fetchCompoundDetails } from './api.js';
import { MoleculeRenderer } from './molecule-renderer.js';

document.addEventListener('DOMContentLoaded', () => {
    const moleculeRenderer = new MoleculeRenderer('molecule-viewer');
    const generateBtn = document.getElementById('generate-btn');
    const compoundInput = document.getElementById('compound-input');
    const formulaElement = document.getElementById('formula');
    const descriptionElement = document.getElementById('description');

    generateBtn.addEventListener('click', async () => {
        const compoundName = compoundInput.value.trim();
        
        if (!compoundName) {
            alert('Please enter a compound name');
            return;
        }

        try {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Loading...';
            
            const details = await fetchCompoundDetails(compoundName);
            console.log('Received details:', details);
            
            if (!details.structure || !Array.isArray(details.structure)) {
                throw new Error('Invalid molecule structure data');
            }

            formulaElement.textContent = `Formula: ${details.formula}`;
            descriptionElement.textContent = `Structure: ${details.description}`;
            
            moleculeRenderer.createMolecule(details);
        } catch (error) {
            alert('Error fetching compound details. Please try again.');
            console.error('Error:', error);
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate';
        }
    });
}); 