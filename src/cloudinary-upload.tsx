import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { CloudinaryBase, RequiredParameters, SuccessEvent } from './types/cloudinary';

interface ICloudinaryUpload extends RequiredParameters {
   onUpload?: (result: any) => void;
   imageWrapperStyles?: React.CSSProperties;
   imageWrapperClassNames?: string;
   imageStyles?: React.CSSProperties;
   imageClassNames?: string;
   buttonStyles?: React.CSSProperties;
   buttonClassNames?: string;
}

const CloudinaryUpload: React.FC<ICloudinaryUpload> = (props) => {
   const {
      buttonClassNames,
      cloudName: cloud_name,
      uploadPreset: upload_preset,
      onUpload,
      imageWrapperStyles,
      imageWrapperClassNames,
      imageStyles,
      imageClassNames,
      buttonStyles
   } = props;
   if (!upload_preset || !cloud_name) throw new Error('Missing cloudName or uploadPreset');

   const [uploadCallbacks, setUploadCallbacks] = useState<SuccessEvent[]>();

   useEffect(() => {
      if (!uploadCallbacks) return;
      onUpload && onUpload(uploadCallbacks);
   }, [uploadCallbacks]);

   const openWidget = () => {
      const widget = (window as unknown as IWindow).cloudinary.createUploadWidget(
         {
            cloudName: cloud_name,
            uploadPreset: upload_preset
         },
         (error, result) => {
            if (result.event === 'success' && result.info.resource_type === 'image') {
               onUpload && onUpload(result);

               // @ts-ignore
               setUploadCallbacks((prev) => {
                  return [...(prev || []), result];
               });
            }
         }
      );

      widget.open();
   };

   return (
      <>
         <Head>
            <script src="https://widget.Cloudinary.com/v2.0/global/all.js" type="text/javascript" />
         </Head>
         <div
            style={{
               display: 'flex',
               flexDirection: 'column',
               gap: '1rem'
            }}
         >
            {uploadCallbacks && (
               <div
                  className={imageWrapperClassNames || ''}
                  style={
                     imageWrapperStyles
                        ? imageWrapperStyles
                        : {
                             maxWidth: '300px',
                             display: 'grid',
                             gap: '10px',
                             gridTemplateColumns: 'auto auto auto'
                          }
                  }
               >
                  {uploadCallbacks.map((cb) => {
                     return (
                        <div
                           style={{
                              position: 'relative'
                           }}
                           id={cb.info.etag}
                        >
                           {/* @ts-ignore */}
                           <style jsx>{`
                              #${cb.info.etag}:hover .cloudinary-close-btn-${cb.info.etag} {
                                 display: flex !important;
                              }
                           `}</style>
                           <img
                              className={imageClassNames || ''}
                              src={cb.info.secure_url}
                              alt={cb.info.original_filename}
                              style={{
                                 width: '100%',
                                 objectFit: 'cover',
                                 height: '80px',
                                 aspectRatio: '1/1',
                                 ...imageStyles
                              }}
                           />
                           <button
                              className={`cloudinary-close-btn-${cb.info.etag}`}
                              style={{
                                 // display: 'none',
                                 display: 'flex',
                                 position: 'absolute',
                                 top: '5px',
                                 right: '5px',
                                 width: 'fit-content',
                                 backgroundColor: 'black',
                                 borderRadius: '50%',
                                 outline: 'none',
                                 border: 'none',
                                 padding: '2px',
                                 cursor: 'pointer'
                              }}
                              onClick={() => {
                                 // @ts-ignore
                                 setUploadCallbacks((prev) => {
                                    // @ts-ignore
                                    return prev.filter((aa) => aa.info.etag !== cb.info.etag);
                                 });
                              }}
                           >
                              <svg width="15" height="15" viewBox="0 0 24 24">
                                 <path
                                    fill="white"
                                    d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6Z"
                                 />
                              </svg>
                           </button>
                        </div>
                     );
                  })}
               </div>
            )}

            <div>
               <button
                  type="button"
                  id="leftbutton"
                  onClick={openWidget}
                  className={buttonClassNames || ''}
                  style={buttonStyles || {}}
               >
                  Upload Image(s)
               </button>
            </div>
         </div>
      </>
   );
};

export { CloudinaryUpload };

interface IWindow extends Window {
   cloudinary: CloudinaryBase;
}
