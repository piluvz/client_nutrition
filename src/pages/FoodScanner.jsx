import React, { useState } from 'react';
import axios from 'axios';
import '../style/FoodScanner.css';

export default function Newcomp() {
    const [image, setImage] = useState(null);
    const [result, setResult] = useState('');
    const [isImageSent, setIsImageSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [safetyStatus, setSafetyStatus] = useState('');

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClick = async () => {
        if (image) {
            setIsLoading(true);
            try {
                const base64Image = image.split(',')[1]; // Extract base64 string without metadata
                const response = await axios.post('http://localhost:3001/analyze-food', {
                    imageBase64: base64Image
                });
                const analysisResult = response.data.result;

                const cleanedResult = analysisResult.replace(/\n+/g, '\n').trim();
                const lines = cleanedResult.split('\n').map(line => line.replace(/^\d+\)\s*/, '').trim());

                const descriptionLine = lines[0];
                const safetyLine = lines[1].toUpperCase().includes("NOT SAFE") ? "NOT SAFE" : "SAFE";
                const portionLine = lines.slice(2).join('\n');

                setSafetyStatus(safetyLine);
                setResult({
                    description: descriptionLine,
                    portion: portionLine
                });


                setIsImageSent(true);
            } catch (error) {
                console.error('Error analyzing image:', error);
                setResult('An error occurred while analyzing the image.');
            } finally {
                setIsLoading(false);
            }
        } else {
            console.log('No image uploaded');
        }
    };

    return (
        <div className='new_cont'>
            <p id='pi'>Сканер - помощник для еды</p>
            <div className="input_back">
                <div className={`image-upload-container ${image ? 'no-border' : ''}`}>
                    {image ? (
                        <>
                        <img src={image} className='user-image' alt="Uploaded" />
                        {isLoading && (
                            <div className="spinner-container">
                                <div className="spinner"></div>
                            </div>
                        )}
                        </>
                        
                    ) : (
                        <div className="image-upload-placeholder">
                            <img src="image_icon.png" className='img_sd' alt="" />
                            <p>Drag the image to this window<br />or choose from the device to get<br />advice about your plate</p>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer',
                        }}
                    />
                    
                </div>
                
                {!isImageSent && !isLoading && (
                    <div className="but_send">
                        <button className="custom-button" onClick={handleClick}>
                            ОТПРАВИТЬ
                        </button>
                    </div>
                )}
                {isImageSent && (
                    <div className='border-div'></div>
                )}


                {result && <div className="result-container">
                    <div className='result-container result-container-2 '>
                        <h2>
                            Your plate is   <span className={safetyStatus === "SAFE" ? "safe" : "not-safe"}>
                                {safetyStatus}
                            </span>
                        </h2>
                    </div>
                    <p>{result.description}</p>
                    <h3>Рекомендации:</h3>
                    <p>{result.portion}</p>
                </div>}
            </div>
            
        </div>
    );
}
