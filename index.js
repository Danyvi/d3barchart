const svgWidth = 600;
const svgHeight = 600;

const svg = d3
  .select('.canvas')
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

// create margins and dimension
const margin = {
  left: 100,
  top: 20,
  right: 20,
  bottom: 100
};

const graphWidth = svgWidth - margin.left - margin.right;
const graphHeight = svgHeight - margin.top - margin.bottom;
 
const graph = svg
  .append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

const xAxisGroup = graph
  .append('g')
  .attr('transform', `translate(0, ${graphHeight})`);

const yAxisGroup = graph
  .append('g');

// scales
// creating an y axis to be scaled
const y = d3
  .scaleLinear()
  .range([graphHeight, 0]);
 
const x = d3
  .scaleBand()
  .range([0, 500])
  .paddingInner(0.2)
  .paddingOuter(0.2);

// create the axes
const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y)
  .ticks(3)
  .tickFormat( d => d + ' orders');

// update x axis text
xAxisGroup
  .selectAll('text')
  .attr('transform', 'rotate(-40)')
  .attr('text-anchor', 'end')
  .attr('fill', 'orange')

// transition
const t = d3.transition().duration(500);


// update function
const update = (data) => {

  const min = d3.min( data, d => d.orders);
  const max = d3.max( data, d => d.orders);
  const extent = d3.extent( data, d => d.orders);

  // 1. Update any scale (domains) if they rely on your data
  // updating scale domains
  y.domain([0, max]);
  x.domain(data.map( item => item.name));

  // 2. Join updated data to the elements rects
  const rects = graph
    .selectAll('rect')
    .data(data);

  // 3. Remove unwanted (if any) shapes using the exit selection
  rects
    .exit()
      .remove();

  // 4. update current shapes in the DOM (everything that is already there)
  rects
    .attr('width', x.bandwidth )
    .attr('fill', 'orange')
    .attr('x', d => x(d.name))
      // .transition(t)
      // .attr('y', d => y(d.orders )) // y ending position
      // .attr('height', d => graphHeight - y(d.orders)); // height ending position

  // 5. append the enter selection in the DOM
    rects
    .enter()
      .append('rect')
      .attr('width', x.bandwidth )
      .attr('height', 0) // starting condition for the height
      .attr('fill', 'orange')
      .attr('x', d => x(d.name))
      .attr('y', graphHeight) // starting condition for the y (at the bottom of our graph)
      .merge(rects) // merge the current element in the DOM (current selection). It applies to the current and the enter selection 
        .transition(t)
        .attr('y', d => y(d.orders )) // y ending condition
        .attr('height', d => graphHeight - y(d.orders)); // height ending condition

  // call the axes
  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);
};


var data = [];

// setting a sort of listener that listen to a database (firebase)
// get data from firestore
// onSnapshot will listen our collection inside the database
// when something inside that collection changes 
// we'll have a response from our database (firestore)
// and it is gona fire the callback function

/**
 * documentChange is an object that represent a change in a document
 * inside a database
 */
db.collection('dishes').onSnapshot( res => {
  // console.log('onSnapshot response', res.docChanges());
  res.docChanges().forEach( documentChange => {
    // console.log('documentChange: ', documentChange);
    // console.log('documentChange.doc.data(): ', documentChange.doc.data());
    const doc = {...documentChange.doc.data(), id: documentChange.doc.id}; // it will take all properties from each doc on the change (documentChange) and spread them out in a new object
    console.log(doc);

    switch (documentChange.type) {
      case 'added':
        data.push(doc);
        break;
      case 'modified':
        const index = data.findIndex(item => item.id == doc.id);
        data[index] = doc; // overwriting the old document with the new 
        break;
      case 'removed':
        data = data.filter(item=>item.id !== doc.id);
        break;
      default:
        break;
    }

  });

  update(data);
});