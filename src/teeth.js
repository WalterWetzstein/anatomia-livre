// FDI / ISO 3950, permanent dentition. Right/left always refer to the person.
// Reference: https://terminology.hl7.org/CodeSystem-ADAUniversalToothDesignationSystem.html
const positions={
 'medial incisor':{position:1,name:'Incisivo central'},'lateral incisor':{position:2,name:'Incisivo lateral'},
 'canine':{position:3,name:'Canino'},'first premolar':{position:4,name:'Primeiro pré-molar'},
 'second premolar':{position:5,name:'Segundo pré-molar'},'first molar tooth':{position:6,name:'Primeiro molar'},
 'second molar tooth':{position:7,name:'Segundo molar'},'third molar tooth':{position:8,name:'Terceiro molar (siso)'}
};
export function toothInfo(source){
 const match=source.match(/^(Upper|Lower) (.+)\.([lr])$/);if(!match||!positions[match[2]])return null;
 const upper=match[1]==='Upper',right=match[3]==='r';const quadrant=upper?(right?1:2):(right?4:3);
 const {position,name}=positions[match[2]];const fullName=`${name} ${upper?'superior':'inferior'} ${right?'direito':'esquerdo'}`;
 return {number:quadrant*10+position,quadrant,position,name:fullName,arch:upper?'Arcada superior':'Arcada inferior',side:right?'Lado direito':'Lado esquerdo',source};
}
export const permanentTeeth=[1,2,3,4].flatMap(quadrant=>Object.keys(positions).map(part=>toothInfo(`${quadrant<3?'Upper':'Lower'} ${part}.${quadrant===1||quadrant===4?'r':'l'}`)));
