export const downloadCertificate = async (certificateId) => {
    try {
        const response = await axios.get(`/api/certificates/${certificateId}/download`, {
            responseType: 'blob',
            headers: {
                'Accept': 'application/pdf'
            }
        });

        // Create a blob from the PDF Stream
        const file = new Blob([response.data], { type: 'application/pdf' });
        
        // Create a URL for the blob
        const fileURL = window.URL.createObjectURL(file);
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = fileURL;
        link.setAttribute('download', `certificate-${certificateId}.pdf`);
        
        // Append to html link element page
        document.body.appendChild(link);
        
        // Start download
        link.click();
        
        // Clean up and remove the link
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(fileURL);
        
        return true;
    } catch (error) {
        console.error('Error downloading certificate:', error);
        throw error;
    }
}; 