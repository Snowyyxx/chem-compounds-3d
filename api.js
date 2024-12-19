export async function fetchCompoundDetails(compoundName) {
    try {
        const response = await fetch('/api/compound', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                compound_name: compoundName
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.error) {
            throw new Error(result.error);
        }

        try {
            const parsedData = JSON.parse(result.data);
            if (!parsedData.structure || !Array.isArray(parsedData.structure)) {
                throw new Error('Invalid molecule structure data');
            }
            return parsedData;
        } catch (parseError) {
            console.error('Error parsing JSON:', result.data);
            throw new Error('Invalid response format from server');
        }
    } catch (error) {
        console.error('Error fetching compound details:', error);
        throw error;
    }
} 