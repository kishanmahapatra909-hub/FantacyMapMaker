import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image, Rect, Circle, Line, Transformer } from 'react-konva';
import useImage from 'use-image';
import { Undo2, Redo2, Trash2, Pencil, MousePointer2 } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { EditorObject } from '../../types';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { ContextMenu } from './ContextMenu';
import { LudoGame } from './LudoGame';
import { SnakesGame } from './SnakesGame';
import { TicTacToeGame } from './TicTacToeGame';

export const CanvasArea: React.FC = () => {
  const { 
    config, selectedIds, setSelectedId, setSelectedIds, toggleSelectedId, updateObject, 
    addObject, zoom, undo, redo, clearObjects, deleteSelected, sendToBack, bringToFront,
    isDrawing, setIsDrawing, drawingColor, setDrawingColor, history,
    setStage, isFullScreen, isIncinerating, setIncinerating, incinerate,
    ludoActive, snakesActive, tictactoeActive, ludoGameId, snakesGameId, tictactoeGameId
  } = useEditorStore();
  const stageRef = useRef<any>(null);
  
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    if (stageRef.current) {
      setStage(stageRef.current);
    }
    return () => setStage(null);
  }, [setStage]);

  const transformerRef = useRef<any>(null);
  
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const drawingLineRef = useRef<any>(null);
  const longPressTimeoutRef = useRef<any>(null);
  const pressStartPosRef = useRef<{ clientX: number; clientY: number } | null>(null);

  // Background Image
  const [bgImage] = useImage(config.background || '', 'anonymous');

  // Predefined drawing colors
  const DRAWING_COLORS = [
    { name: 'Ancient Brown', value: '#8b4513' },
    { name: 'Blood Red', value: '#991b1b' },
    { name: 'Imperial Gold', value: '#eab308' },
    { name: 'Emerald Green', value: '#166534' },
    { name: 'Abyss Black', value: '#1c1917' },
    { name: 'Pure White', value: '#fafaf9' },
  ];

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // If clicking outside the main canvas area and not in a tool window, deselect
      const target = e.target as HTMLElement;
      const isCanvas = !!target.closest('.konvajs-content');
      const isToolbar = !!target.closest('header') || !!target.closest('.absolute.top-12'); // top toolbar or floating toolbar
      const isSidebar = !!target.closest('aside') || !!target.closest('.w-80'); // Asset library or Properties panel
      const isModal = !!target.closest('[role="dialog"]');
      const isContextMenu = !!target.closest('.context-menu-container');

      if (!isCanvas && !isToolbar && !isSidebar && !isModal && !isContextMenu) {
        setSelectedId(null);
      }
    };

    window.addEventListener('mousedown', handleGlobalClick);
    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, [setSelectedId]);

  useEffect(() => {
    if (transformerRef.current && stageRef.current) {
      const selectedNodes = selectedIds
        .map(id => stageRef.current.findOne('#' + id))
        .filter(Boolean);
      
      transformerRef.current.nodes(selectedNodes);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedIds, config.objects]);

  const handleContextMenuAt = (clientX: number, clientY: number, target: any) => {
    const clickedId = target.id();
    if (clickedId && !selectedIds.includes(clickedId)) {
      setSelectedId(clickedId);
    }
    setContextMenu({ x: clientX, y: clientY });
  };

  const startLongPress = (e: any) => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }

    const evt = e.evt;
    if (!evt) return;

    let clientX = 0;
    let clientY = 0;

    if (evt.touches && evt.touches.length > 0) {
      clientX = evt.touches[0].clientX;
      clientY = evt.touches[0].clientY;
    } else if (evt.clientX !== undefined) {
      clientX = evt.clientX;
      clientY = evt.clientY;
    } else {
      return;
    }

    pressStartPosRef.current = { clientX, clientY };
    const target = e.target;

    longPressTimeoutRef.current = setTimeout(() => {
      handleContextMenuAt(clientX, clientY, target);
      longPressTimeoutRef.current = null;
    }, 3000);
  };

  const moveLongPress = (e: any) => {
    if (!pressStartPosRef.current) return;

    const evt = e.evt;
    if (!evt) return;

    let clientX = 0;
    let clientY = 0;

    if (evt.touches && evt.touches.length > 0) {
      clientX = evt.touches[0].clientX;
      clientY = evt.touches[0].clientY;
    } else if (evt.clientX !== undefined) {
      clientX = evt.clientX;
      clientY = evt.clientY;
    } else {
      return;
    }

    const dx = clientX - pressStartPosRef.current.clientX;
    const dy = clientY - pressStartPosRef.current.clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 10) {
      cancelLongPress();
    }
  };

  const cancelLongPress = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    pressStartPosRef.current = null;
  };

  const handleStageMouseDown = (e: any) => {
    startLongPress(e);

    if (isDrawing) {
      const pos = e.target.getStage().getPointerPosition();
      
      addObject({
        type: 'path',
        subType: 'freehand',
        points: [pos.x / zoom, pos.y / zoom],
        x: 0,
        y: 0,
        stroke: drawingColor,
      });
      
      // We set selection to this new line to track it during mouse move
      const objects = useEditorStore.getState().config.objects;
      const lastObj = objects[objects.length - 1];
      if (lastObj) setSelectedId(lastObj.id);
      return;
    }

    // Deselect if clicking on empty stage
    if (e.target === e.target.getStage()) {
      setSelectedIds([]);
      return;
    }

    // Handle multi-selection with Shift key
    const id = e.target.id();
    const isShiftPressed = e.evt.shiftKey;

    if (id) {
      if (isShiftPressed) {
        toggleSelectedId(id);
      } else {
        // If clicking on an unselected item without shift, select only it
        if (!selectedIds.includes(id)) {
          setSelectedId(id);
        }
      }
    } else {
      // Clicking on an empty area inside the canvas (like background or un-labeled design cells)
      // Check if clicking a Transformer anchor handle or rotator to avoid deselecting while resizing/repositioning
      const isTransformer = e.target.className === 'Transformer' || (e.target.getParent() && e.target.getParent().className === 'Transformer');
      if (!isTransformer) {
        setSelectedIds([]);
      }
    }
  };

  const handleContextMenu = (e: any) => {
    if (e.evt) {
      e.evt.preventDefault();
      handleContextMenuAt(e.evt.clientX, e.evt.clientY, e.target);
    }
  };

  const handleContextAction = (action: string) => {
    switch (action) {
      case 'delete':
        deleteSelected();
        break;
      case 'bringToFront':
        selectedIds.forEach(id => bringToFront(id));
        break;
      case 'sendToBack':
        selectedIds.reverse().forEach(id => sendToBack(id));
        break;
    }
  };

  const handleStageMouseMove = (e: any) => {
    moveLongPress(e);

    const selectedId = selectedIds[selectedIds.length - 1];
    if (!isDrawing || !selectedId) return;

    const currentObj = config.objects.find(o => o.id === selectedId);
    if (!currentObj || currentObj.type !== 'path') return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    const newPoints = [...(currentObj.points || []), point.x / zoom, point.y / zoom];
    updateObject(selectedId, { points: newPoints });
  };

  const handleStageMouseUp = () => {
    cancelLongPress();

    if (isDrawing) {
      setSelectedId(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const assetData = e.dataTransfer.getData('asset');
    if (assetData && stageRef.current) {
      try {
        const asset = JSON.parse(assetData);
        
        // Calculate position relative to the stage content
        const container = stageRef.current.container();
        const rect = container.getBoundingClientRect();
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Account for stage scale to get world coordinates
        const stageX = mouseX / zoom;
        const stageY = mouseY / zoom;

        addObject({
          type: asset.type,
          subType: asset.subType,
          src: asset.src,
          x: stageX - 40, // center the 80x80 object
          y: stageY - 40,
          width: 80,
          height: 80,
          fill: '#ffd700',
        });
      } catch (err) {
        console.error('Failed to drop asset:', err);
      }
    }
  };

  const getClipFunc = (ctx: any) => {
    const w = Math.max(containerSize.width, 1500);
    const h = Math.max(containerSize.height, 1000);

    ctx.beginPath();
    switch (config.boardShape) {
      case 'Circle':
        ctx.arc(w / 2, h / 2, Math.min(w, h) / 2 - 40, 0, Math.PI * 2);
        break;
      case 'Triangle':
        ctx.moveTo(w / 2, 40);
        ctx.lineTo(w - 40, h - 40);
        ctx.lineTo(40, h - 40);
        ctx.closePath();
        break;
      case 'Diamond': {
        ctx.moveTo(w / 2, 40);
        ctx.lineTo(w - 40, h / 2);
        ctx.lineTo(w / 2, h - 40);
        ctx.lineTo(40, h / 2);
        ctx.closePath();
        break;
      }
      case 'Pentagon': {
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) / 2 - 40;
        for (let i = 0; i < 5; i++) {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
          const px = cx + r * Math.cos(angle);
          const py = cy + r * Math.sin(angle);
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();
        break;
      }
      case 'Octagon': {
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) / 2 - 40;
        for (let i = 0; i < 8; i++) {
          const angle = -Math.PI / 2 + Math.PI / 8 + (i * 2 * Math.PI) / 8;
          const px = cx + r * Math.cos(angle);
          const py = cy + r * Math.sin(angle);
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();
        break;
      }
      case 'Oval': {
        const cx = w / 2;
        const cy = h / 2;
        const rx = w / 2 - 40;
        const ry = h / 2 - 40;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        break;
      }
      case 'Star': {
        const cx = w / 2;
        const cy = h / 2;
        const rOut = Math.min(w, h) / 2 - 40;
        const rIn = rOut * 0.45;
        for (let i = 0; i < 10; i++) {
          const isOuter = i % 2 === 0;
          const angle = -Math.PI / 2 + (i * Math.PI) / 5;
          const r = isOuter ? rOut : rIn;
          const px = cx + r * Math.cos(angle);
          const py = cy + r * Math.sin(angle);
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();
        break;
      }
      case 'Square':
      case 'Rectangle':
        const sizeW = w - 80;
        const sizeH = h - 80;
        ctx.rect((w - sizeW) / 2, (h - sizeH) / 2, sizeW, sizeH);
        break;
      case 'Ancient Scroll':
        ctx.moveTo(80, 40);
        ctx.lineTo(w - 80, 40);
        ctx.quadraticCurveTo(w + 40, h / 2, w - 80, h - 40);
        ctx.lineTo(80, h - 40);
        ctx.quadraticCurveTo(-40, h / 2, 80, 40);
        break;
      default: // Default Rectangle logic
        ctx.rect(40, 40, w - 80, h - 80);
    }
    ctx.closePath();
  };

  const boardSize = {
    width: Math.max(containerSize.width, 1500),
    height: Math.max(containerSize.height, 1000)
  };

  if (ludoActive) {
    return (
      <div className="w-full h-full bg-[#060504] flex items-center justify-center p-4 overflow-y-auto custom-scrollbar">
        <LudoGame key={ludoGameId} />
      </div>
    );
  }

  if (snakesActive) {
    return (
      <div className="w-full h-full bg-[#060504] flex items-center justify-center p-4 overflow-y-auto custom-scrollbar">
        <SnakesGame key={snakesGameId} />
      </div>
    );
  }

  if (tictactoeActive) {
    return (
      <div className="w-full h-full bg-[#060504] flex items-center justify-center p-4 overflow-y-auto custom-scrollbar">
        <TicTacToeGame key={tictactoeGameId} />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0a0a0a]">
      {/* Floating Toolbar - outside scrollable area */}
      <motion.div 
        initial={false}
        animate={{ 
          y: isFullScreen && isDrawing === false ? -100 : 0,
          opacity: isFullScreen && isDrawing === false ? 0 : 1 
        }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-3 bg-[#161311]/95 border border-[#3a3022] rounded-full shadow-2xl backdrop-blur-md max-w-[calc(100vw-32px)] overflow-x-auto no-scrollbar"
      >
        <div className="flex items-center gap-1 pr-2 md:pr-4 border-r border-[#3a3022] shrink-0">
          <button 
            onClick={() => setIsDrawing(false)}
            className={`p-1.5 md:p-2 rounded-full transition-all ${!isDrawing ? 'bg-[#ffd700] text-black' : 'text-stone-500 hover:text-stone-300'}`}
            title="Selection Mode"
          >
            <MousePointer2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          
          <div className="flex items-center gap-1 md:gap-1.5 ml-1 md:ml-2">
            <button 
              onClick={() => setIsDrawing(true)}
              className={`p-1.5 md:p-2 rounded-full transition-all ${isDrawing ? 'bg-[#ffd700] text-black' : 'text-stone-500 hover:text-stone-300'}`}
              title="Path Tool"
            >
              <Pencil className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            
            {isDrawing && (
              <div className="flex items-center gap-1 ml-1 px-1.5 py-0.5 md:py-1 bg-black/30 rounded-full border border-[#3a3022]">
                {DRAWING_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setDrawingColor(color.value)}
                    className={`w-3 h-3 md:w-4 md:h-4 rounded-full border border-white/20 transition-all hover:scale-125 ${drawingColor === color.value ? 'ring-2 ring-offset-2 ring-offset-[#1a1614] ring-[#ffd700]' : ''}`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 px-2 md:px-4 border-r border-[#3a3022] shrink-0">
          <button 
            onClick={undo}
            disabled={history.past.length === 0}
            className={`p-1.5 md:p-2 rounded-full transition-all ${history.past.length > 0 ? 'text-stone-300 hover:bg-stone-800' : 'text-stone-700 cursor-not-allowed'}`}
            title="Undo"
          >
            <Undo2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button 
            onClick={redo}
            disabled={history.future.length === 0}
            className={`p-1.5 md:p-2 rounded-full transition-all ${history.future.length > 0 ? 'text-stone-300 hover:bg-stone-800' : 'text-stone-700 cursor-not-allowed'}`}
            title="Redo"
          >
            <Redo2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        <div className="pl-1 md:pl-2 shrink-0">
          <button 
            onClick={() => {
              incinerate();
            }}
            className="p-1.5 md:p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
            title="Incinerate All"
          >
            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </motion.div>

      {/* Scrollable Container */}
      <div 
        ref={containerRef} 
        className={cn(
          "w-full h-full overflow-auto flex items-center justify-center p-20 custom-scrollbar scroll-smooth",
          isFullScreen ? "p-4" : "p-20"
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex-shrink-0 min-w-full min-h-full flex items-center justify-center py-20 px-20">
          <div className="shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-zinc-800 rounded-lg overflow-visible bg-[#1a1614] inline-block">
            <Stage
              width={boardSize.width * zoom}
              height={boardSize.height * zoom}
              onMouseDown={handleStageMouseDown}
              onMouseMove={handleStageMouseMove}
              onMouseUp={handleStageMouseUp}
              onTouchStart={handleStageMouseDown}
              onTouchMove={handleStageMouseMove}
              onTouchEnd={handleStageMouseUp}
              onContextMenu={handleContextMenu}
              scaleX={zoom}
              scaleY={zoom}
              ref={stageRef}
            >
          {/* Background Layer with Clipping */}
          <Layer clipFunc={getClipFunc}>
            <Rect 
              width={boardSize.width} 
              height={boardSize.height} 
              fill="#1a1614" 
              listening={false}
            />
            {bgImage && (
              <Image
                image={bgImage}
                width={boardSize.width}
                height={boardSize.height * 1.2}
                y={-boardSize.height * 0.1}
                listening={false}
                opacity={0.8}
              />
            )}
            
            {/* Parchment texture overlay for board */}
            <Rect
              width={boardSize.width}
              height={boardSize.height}
              fill="#f4e4bc"
              opacity={0.1}
              listening={false}
            />
          </Layer>

          {/* Interaction Layer */}
          <Layer clipFunc={getClipFunc}>
            {config.objects.map((obj) => (
              <RenderObject 
                key={obj.id} 
                obj={obj} 
                isSelected={selectedIds.includes(obj.id)}
                isDrawing={isDrawing}
                isIncinerating={isIncinerating}
                onSelect={() => setSelectedId(obj.id)}
                onChange={(newAttrs) => updateObject(obj.id, newAttrs)}
                boardSize={boardSize}
              />
            ))}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  </div>
  {contextMenu && (
    <ContextMenu
      x={contextMenu.x}
      y={contextMenu.y}
      selectedCount={selectedIds.length}
      onClose={() => setContextMenu(null)}
      onAction={handleContextAction}
    />
  )}
</div>
  );
};

interface RenderObjectProps {
  obj: EditorObject;
  isSelected: boolean;
  isDrawing: boolean;
  isIncinerating: boolean;
  onSelect: () => void;
  onChange: (attrs: Partial<EditorObject>) => void;
  boardSize: { width: number, height: number };
}

const RenderObject: React.FC<RenderObjectProps> = ({ obj, isSelected, isDrawing, isIncinerating, onSelect, onChange, boardSize }) => {
  const [image] = useImage(obj.src || '', 'anonymous');
  
  const nodeRef = useRef<any>(null);

  useEffect(() => {
    if (image && obj.metadata?.fitToBoard) {
      const margin = 100; // Extra margin to ensure it fits well
      const maxWidth = boardSize.width - margin;
      const maxHeight = boardSize.height - margin;
      
      const imgWidth = image.width;
      const imgHeight = image.height;
      
      const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
      
      const newWidth = imgWidth * ratio;
      const newHeight = imgHeight * ratio;
      
      onChange({
        width: newWidth,
        height: newHeight,
        scaleX: 1,
        scaleY: 1,
        x: (boardSize.width - newWidth) / 2,
        y: (boardSize.height - newHeight) / 2,
        metadata: { ...obj.metadata, fitToBoard: false }
      });
    }
  }, [image, obj.metadata?.fitToBoard, boardSize, onChange, obj.metadata]);

  useEffect(() => {
    if (isIncinerating && isSelected && nodeRef.current) {
      // Create a "burning/incinerating" animation
      nodeRef.current.to({
        duration: 0.8,
        scaleX: (obj.scaleX || 1) * 1.8,
        scaleY: (obj.scaleY || 1) * 1.8,
        opacity: 0,
        rotation: (obj.rotation || 0) + 90,
        shadowColor: '#ef4444',
        shadowBlur: 50,
        shadowOpacity: 1,
        easing: 'EaseIn',
      });
    }
  }, [isIncinerating, isSelected, obj.scaleX, obj.scaleY, obj.rotation]);
  
  const commonProps = {
    ref: nodeRef,
    id: obj.id,
    x: obj.x,
    y: obj.y,
    rotation: obj.rotation || 0,
    draggable: !isDrawing && !isIncinerating,
    listening: (!isDrawing || obj.type === 'path') && !isIncinerating,
    onClick: isDrawing ? undefined : onSelect,
    onTap: isDrawing ? undefined : onSelect,
    onDragEnd: (e: any) => {
      onChange({ x: e.target.x(), y: e.target.y() });
    },
    onTransformEnd: (e: any) => {
      const node = e.target;
      onChange({
        x: node.x(),
        y: node.y(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
        rotation: node.rotation()
      });
    }
  };

  if (obj.type === 'path') {
     return (
       <Line 
         {...commonProps} 
         points={obj.points || [0, 0, 50, 50]} 
         stroke={obj.stroke || '#8b4513'} 
         strokeWidth={6}
         lineCap="round"
         lineJoin="round"
         shadowColor="rgba(0,0,0,0.3)"
         shadowBlur={10}
         tension={0.5}
       />
     );
  }

  if (obj.src) {
    return (
      <Image
        {...commonProps}
        image={image}
        width={obj.width || 50}
        height={obj.height || 50}
        scaleX={obj.scaleX || 1}
        scaleY={obj.scaleY || 1}
      />
    );
  }

  return (
    <Rect
      {...commonProps}
      width={obj.width || 50}
      height={obj.height || 50}
      fill={obj.fill || '#fff'}
      scaleX={obj.scaleX || 1}
      scaleY={obj.scaleY || 1}
    />
  );
};
