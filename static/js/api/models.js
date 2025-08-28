export async function getModels() {
    try {
        const response = await fetch('/api/get-models', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', 
            },
        });
        if (!response.ok) {
            throw new Error(`getModels(): HTTP Error! Status: ${response.status}`);
        }
        const data = await response.text();  
        try {
            const jsonData = JSON.parse(data);
            return jsonData;
        } catch (jsonError) {
            throw new Error('getModels(): Invalid JSON Response');
        }
    } catch (error) {
        console.error('getModels(): Error in fetching the models: ', error);
        return null; 
    }
}
