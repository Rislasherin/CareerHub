import React from 'react';
import { ShieldAlert, VideoOff, MicOff } from 'lucide-react';

interface InterviewIntegrityModalProps {
  blockingReason: string | null;
  showGazeWarning?: boolean;
  clearIntegrityBlock: () => void;
  toggleCamera?: () => void;
  toggleMicrophone?: () => void;
}

export const InterviewIntegrityModal: React.FC<InterviewIntegrityModalProps> = ({
  blockingReason,
  showGazeWarning,
  clearIntegrityBlock,
  toggleCamera,
  toggleMicrophone
}) => {
  if (!blockingReason && !showGazeWarning) return null;

  return (
    <>
      {/* Floating Gaze Warning */}
      {!blockingReason && showGazeWarning && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[9999] bg-slate-800 border border-slate-700 shadow-2xl rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-top-4 fade-in">
          <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Interview reminder</h3>
            <p className="text-xs text-slate-400 mt-0.5">Please remain focused on the interview screen.</p>
          </div>
        </div>
      )}

      {/* Blocking Modal */}
      {blockingReason && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-slate-200">
            
            {/* TAB SWITCH / BLUR */}
        {(blockingReason === 'TAB_SWITCH' || blockingReason === 'WINDOW_BLUR') && (
          <>
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Interview paused</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              You left the interview window. For interview integrity, please stay on this interview screen until the interview is completed.
              <br /><br />
              <span className="font-semibold">This activity has been recorded.</span>
            </p>
            <button
              onClick={clearIntegrityBlock}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Return to Interview
            </button>
          </>
        )}

        {/* CAMERA DISABLED */}
        {blockingReason === 'CAMERA_DISABLED' && (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <VideoOff size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Camera required</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Your camera is currently disabled. Please enable your camera to continue the interview.
            </p>
            {toggleCamera ? (
              <button
                onClick={toggleCamera}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Enable Camera
              </button>
            ) : (
              <p className="text-sm text-slate-500">Please enable your camera from the browser controls.</p>
            )}
          </>
        )}

        {/* MIC DISABLED */}
        {blockingReason === 'MIC_DISABLED' && (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <MicOff size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Microphone required</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Your microphone is currently disabled. Please enable your microphone to continue the interview.
            </p>
            {toggleMicrophone ? (
              <button
                onClick={toggleMicrophone}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Enable Microphone
              </button>
            ) : (
              <p className="text-sm text-slate-500">Please enable your microphone from the browser controls.</p>
            )}
          </>
        )}

        {/* FACE NOT DETECTED */}
        {blockingReason === 'FACE_NOT_DETECTED' && (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <VideoOff size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Camera check</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              We can't currently detect your face. Please make sure your face is visible in the camera.
            </p>
            <div className="text-xs text-slate-500 animate-pulse font-semibold">Waiting for face detection...</div>
          </>
        )}

        {/* MULTIPLE FACES DETECTED */}
        {blockingReason === 'MULTIPLE_FACES_DETECTED' && (
          <>
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Camera check</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              More than one person is visible in the camera. Please make sure only you are visible during the interview.
            </p>
            <div className="text-xs text-slate-500 animate-pulse font-semibold">Waiting for single face...</div>
          </>
        )}

          </div>
        </div>
      )}
    </>
  );
};
