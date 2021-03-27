
import './App.css';
import buliderType from './builderType.json'
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import update from 'immutability-helper';
import $ from "jquery";

const ListBox = (props) =>{
  const { 
    index,
    component, 
    components,
    drop, 
    allowDrop ,
    removeComponent,
    addRow,
    removeRow, 
    moveDrag,
    moveDragEnd
  } = props;
  const {type, name, id, groupId, leftOrRight} = component

    if(type === -5){
        return(<div className="replaceAdd"></div>)
    }

    if(type === 11){
      return( 
            <div className="ListBoxCard lc" data-type={type} index={index} data-id={id} >
              <div>{name} <span className="remove" onClick={()=>removeComponent({id})} >x</span> </div>
              <div className="groupDrop" onDrop={drop} onDragOver={allowDrop} data-group-id={id}>
                {
                  components.filter(({groupId:getGroupId})=> getGroupId === id).map((component, k) =>(<ListBox 
                                                                                                        key={k} 
                                                                                                        index={k} 
                                                                                                        component={component} 
                                                                                                        components={components} 
                                                                                                        drop={drop} 
                                                                                                        allowDrop={allowDrop} 
                                                                                                        removeComponent={removeComponent} 
                                                                                                        addRow={addRow} 
                                                                                                        removeRow={removeRow}
                                                                                                        moveDrag={moveDrag}
                                                                                                        moveDragEnd={moveDragEnd}
                                                                                                         />) )
                }
              </div> 
            </div>
          )
    }

    if(type !== 11 && leftOrRight === -1){
      return(
        <div className="ListBoxCard lc" data-type={type} index={index}  data-id={id} draggable="true" onDragStart={moveDrag} onDragEnd={moveDragEnd}>
          <div>{name}  
            <div>
              <span className="remove" onClick={()=>removeComponent({id})}>x</span>  
              <span onClick={()=>addRow(id, groupId)}>+</span>
            </div>
          </div> 
        </div>
      )
    }
    if(type !== 11 && leftOrRight === 1){
      return(<></>)
    }
    if(type !== 11 && leftOrRight === 0){
      const index = components.findIndex(({id:getId}) => getId === id)
      const nextComponent = components[index+1]

      const {type:nextType, id:nextId, name:nextName} = nextComponent;



      return(
        <div className='ListBoxCard_flex lc' data-type={-2} index={index}  data-id={-2}>
        <div className="ListBoxCard">
          <div>{name}  
            <div>
              <span className="remove" onClick={()=>removeComponent({id, nextId})}>x</span>  
            </div>
          </div> 
        </div>

        {nextType === 14 &&

          <div className="addComponent" onDrop={drop} onDragOver={allowDrop} data-update-id={nextId}>
            SPACE <span className="removeRow" onClick={()=>removeRow(nextId, id)} >-</span>
          </div>

        }
        {nextType !== 14 &&

        <div className="ListBoxCard">
        <div>{nextName}  
          <div>
            <span className="remove" onClick={()=>removeRow(nextId, id)}>x</span>  
          </div>
        </div> 
        </div>

        }
        </div>
      )
    }

 
}

const App = () => {

  const [components, setComponents] = useState([])

  const [updateDrop, setUpdateDrop] = useState({});
  const [updateId, setUpdateId] = useState({});

  const [lastIndex, setLastIndex] = useState(-1)
  const [copyComponent, setCopyComponent] = useState({})

  useEffect(()=>{
    return () =>{
      setUpdateDrop({})
      setUpdateId({})
    }
  }, [])

  useEffect(()=>{
    console.log(components);
  }, [components])

  useEffect(()=>{
    if(!updateDrop?.id) return;

    console.log(updateDrop);
    const isAddReplace = components.findIndex(({type}) => type === -5)

    if(isAddReplace !== -1){
      setComponents(update(components, {
        $splice:[
          [isAddReplace, 1],
          [isAddReplace, 0, updateDrop]
        ]
      }))
    }
    else setComponents(prevState => ([...prevState, updateDrop]))

  }, [updateDrop])

  useEffect(()=>{
    if(!updateId?.id) return

    console.log(updateId);
    const {id, type} = updateId;
    const index = components.findIndex(({id:getId}) => getId === id)
    const arrayComponents = update(components, {[index]:{type:{$set:type}, name:{$set:buliderType.find(({id}) => id === type).name}}})
  
    // console.log(arrayComponents);
    setComponents([...arrayComponents])
  }, [updateId])

  const allowDrop = useCallback((ev)=>{
    ev.preventDefault();

    const type = ev.target.getAttribute('data-type')
    const index = Number(ev.target.getAttribute('index'))
    const id = ev.target.getAttribute('data-id')

    // if(copyComponent?.id){
    //   document.querySelector(`*[data-id="${copyComponent.id}"]`).style.display = 'none';
    //   return
    // }

    var groupId = '-1'
    const isGroupId = ev.target.closest('div[data-group-id]').getAttribute('data-group-id')
    // console.log(isGroup);
    if(isGroupId) groupId =isGroupId

    // console.log($(ev.target).hasClass('.replaceAdd'), ev.target.classList.contains("replaceAdd"));

    if(type){
      // if([11, -5, -2].indexOf(Number(type)) === -1){
      console.log({type:Number(type), index, lastIndex, id});

      const arrayComponents2 = components.filter(({id}) => id !== -1) 
      const indexComponents = components.findIndex(({id:getId}) => getId === id)
   
      const newMoveComponent = {
        id:-1, 
        type:-5, 
        groupId, 
        name:'move card', 
        HalfRow:0,
        leftOrRight:-1
      }

      const getComponent = components[indexComponents];
      console.log(getComponent);
      const arrayComponents = update(arrayComponents2, {
        $splice:[
          // [index, 1]
          [indexComponents, 0, newMoveComponent]
        ]
      })


      // console.log(arrayComponents);
      setComponents([...arrayComponents])
      
    }

    // setLastIndex(index)

    // ListBoxCard
    ev.target.style.backgroundColor = ''

    var color = '#e2ffde63'
    // var color = 'red'

    const isListBox = ev.target.classList.contains("ListBox")
    if(isListBox){
      ev.target.style.backgroundColor = color
    }

    const isGroupDrop = ev.target.classList.contains("groupDrop")
    if(isGroupDrop){
      ev.target.style.backgroundColor = color
    }

    const isAddComponent = ev.target.classList.contains("addComponent")
    if(isAddComponent){
      ev.target.style.backgroundColor = color
    }

  }, [components, copyComponent])



  const dragLeave = (ev) => {
    ev.preventDefault();
    // console.log(ev);

  //  const divs = ev.target.closest('.ListBox').querySelectorAll(".lc")
  //     divs.forEach((div, i) => {
  //         div.style.transform = ''
  //     });

  const isBox = ev.target.classList.contains("replaceAdd")
  if(!isBox){
    setComponents(components.filter(({type}) => type !== -5))
  }

  // console.log(ev.target);
  console.log(isBox);
  // console.log($(ev.target).hasClass('.replaceAdd'));

  // const isBox = ev.target.closest('.lc') 
  // if(isBox) return
  // // if(!isBox){
  //   setComponents(components.filter(({type}) => type !== -5))
  // // }
      
    ev.target.style.backgroundColor = ''

  }
  
  const drag = (ev) => {
    // console.log(ev.target);
    ev.dataTransfer.setData("CARD", Number(ev.target.getAttribute('data-id')));
  }
  const moveDrag = useCallback((ev) =>{
    const id = ev.target.getAttribute('data-id')

    console.log('moveDrag');
    ev.target.style.opacity = 0.4

    setCopyComponent(components.find(({id:getId}) => getId === id))


  }, [components])


  const moveDragEnd = (ev) =>{
    ev.target.style.opacity = 1
  }


  const drop = useCallback((ev)=>{
    ev.preventDefault();
    ev.target.style.backgroundColor = ''

    var id = Number( ev.dataTransfer.getData("CARD") );
    var groupId = ev.target.getAttribute('data-group-id')
    var updateId = ev.target.getAttribute('data-update-id')

    // var moveId = ev.dataTransfer.getData("MOVE_CARD")
    // if(moveId){
    //   console.log(moveId);
    //   return 
    // }

    if(copyComponent?.id){
      var { id } = copyComponent
      console.log({copyComponent});
      const lastIndex = components.findIndex(({id:getId}) => getId === id)
      const nowIndex = components.findIndex(({id}) => id === -1)


      $('.ListBoxCard').css({opacity:1})

      // const divs = document.querySelectorAll('.ListBoxCard')
      // divs.forEach((div)=>{
      //   div.style.opacity = 1
      // })


      console.log({nowIndex});

      if(nowIndex === -1){

        const arrayComponents = components.filter(({id:getId}) => getId !== copyComponent.id);
        setComponents([...arrayComponents, copyComponent])

      }else{

        const arrayComponents = update(components, {
          $splice:[
            [lastIndex, 1],
            [nowIndex, 0, copyComponent]
          ]
        })

        setComponents([...arrayComponents.filter(({id}) => id !== -1)])
      }

      setCopyComponent({})
      return
    }

    if(groupId){
      const newComponent = {
        id:uuid(), 
        type:id, 
        groupId, 
        name:buliderType.find(({id:getId}) => getId === id).name, 
        HalfRow:0,
        leftOrRight:-1
      }
      setUpdateDrop(newComponent)
    }

    if(updateId){
      setUpdateId({id:updateId, type:id})
    }

    

  }, [updateDrop, updateId, copyComponent, components])



  // const moveDrop = (ev) =>{
  //   var id = Number( ev.dataTransfer.getData("CARD") );
  // }

  const removeComponent = ({id, nextId = 0}) =>{
    const arrayComponents = components.filter(({groupId}) => groupId !== id)
    const arrayComponents2 = arrayComponents.filter(({id:getId}) => getId !== id && getId !== nextId)

    setComponents(([...arrayComponents2]))

  }

  const addRow = (id, groupId) =>{
      const componentIndex = components.findIndex(({id:getId}) => getId === id);
      // console.log(componentIndex);
      const newComponent = {
        id:uuid(), 
        type:14, 
        groupId, 
        name:'Half Row', 
        HalfRow:1,
        leftOrRight:1
      }

      const arrayComponents = update(components, {[componentIndex]:{HalfRow:{$set:1}, leftOrRight:{$set:0}}})
      const arrayComponents2 = update(arrayComponents, {
        $splice:[
          [componentIndex+1, 0, newComponent]
        ]
      })
      // console.log(arrayComponents2);
      setComponents([...arrayComponents2])
  }

  const removeRow = (id, prevId) =>{
    const arrayComponent = components.filter(({id:getId}) => getId !== id) 
    const index = arrayComponent.findIndex(({id})=> id === prevId)

    const arrayComponent2 = update(arrayComponent, {[index]:{HalfRow:{$set:0}, leftOrRight:{$set:-1}}})

    // console.log(arrayComponent2);
    setComponents([...arrayComponent2])
  }

  return (<>
  <h2>ReactJS with Javascript - Drag and Drop</h2>

<div className="flex">
    <div >

      {
        buliderType.map(({id, name}, k) => (
          <div key={k} className="box" draggable="true" onDragStart={drag} id={`drag_${id}`} data-id={id} >{name}</div>
        ))
      }
      {/* <div draggable="true" onDragStart={drag} id="drag1" width="88" height="31">dev</div> */}
    </div>

    <div className="ListBox" onDrop={drop} onDragOver={allowDrop} onDragLeave={dragLeave} data-group-id={0} >
      {
        components.filter(({groupId})=> groupId === '0').map((component, k) =>(<ListBox 
                                                                                    key={k} 
                                                                                    index={k} 
                                                                                    component={component} 
                                                                                    components={components} 
                                                                                    drop={drop} 
                                                                                    allowDrop={allowDrop} 
                                                                                    removeComponent={removeComponent} 
                                                                                    addRow={addRow}
                                                                                    removeRow={removeRow} 
                                                                                    moveDrag={moveDrag}
                                                                                    moveDragEnd={moveDragEnd}
                                                                                    />) )
      }
    </div>
  </div>
  </>);
}

export default App;
