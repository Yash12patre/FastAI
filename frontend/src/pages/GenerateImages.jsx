import { Image, Sparkles } from 'lucide-react';
import React, { useState } from 'react'

const GenerateImages = () => {

  const imageStyle=['Realistic','Ghibli style','Anime Style','Cartoon Style','Fantasy Style','Realistic Style','3D Style','Portrait style']

  const [selectedStyle , setSelectedStyle]=useState('General');
  const [input , setInput]=useState('');
  const [publish, setPublish]=useState(false)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");

  const onSubmitHandler=async(e)=>{
    e.preventDefault();
    setLoading(true);
    setError("");
    setGeneratedImage("");
    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: `${input} (${selectedStyle})`,
          publish
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedImage(data.content);
      } else {
        setError(data.message || "Failed to generate image.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
                    
      {/* left col */}
      <form
      onSubmit={onSubmitHandler}
        className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'
        action="">
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#00AD25]' />
          <h1 className='text-xl font-semibold'>Ai Image Generator</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Describe Your Image</p>
        <textarea placeholder='descrive waht you want to see int he image...'
        onChange={(e)=>setInput(e.target.value)} value={input} rows={4} required
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300' 
        />
        <p className='mt-4 text-sm font-medium'>Style</p>
        <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
          {imageStyle.map((item)=>(
            <span
            onClick={()=>setSelectedStyle(item)}
            className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${selectedStyle === item ? 'bg-green-50 text-green-700' :'text-gray-500 border-gray-300'}`}
            key={item}>{item}</span>
          ))}
        </div>
        <div className='my-6 flex items-center gap-2'>
            <label className='relative cursor-pointer'>
              <input type="checkbox" onChange={(e)=>setPublish(e.target.checked)} checked={publish} className='sr-only peer' />
              <div className='w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-500 transition'></div>
              <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4'></span>
            </label>
            <p className='text-sm'>Make This Image Public</p>
        </div>
       
        <button className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00AD25] to-[#04FF50] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
          <Image className='w-5'/> Generate Image 
        </button>
      </form>
      {/* right col */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-88 '>
        <div className='flex items-center gap-3'>
          <Image className='w-5 h-5 text-[#8E37EB]' />
          <h1 className='text-xl font-semibold'>Generated Image </h1>
         

        </div>
        <div className='flex-1 flex justify-center items-center'>
          {loading ? (
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Image className='w-9 h-9 animate-spin' />
              <p>Generating image...</p>
            </div>
          ) : error ? (
            <div className='text-red-500 text-center'>{error}</div>
          ) : generatedImage ? (
            <img src={generatedImage} alt="Generated" className='max-w-full max-h-80 rounded-lg border' />
          ) : (
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Image className='w-9 h-9 ' />
              <p className=''>Enter a topic and click “Generate IMage ” to get started</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default GenerateImages