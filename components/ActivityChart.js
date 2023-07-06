import * as d3 from 'd3';
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export function ActivityChart() {
  const [data, setData] = useState([]);

  const svgWidth = 800;
  const svgHeight = 600;
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  const updateChart = (data) => {
    const svg = d3.select('.canvas svg');
    const chart = svg.select('g');
    const xAxisGroup = chart.select('.x-axis');
    const yAxisGroup = chart.select('.y-axis');

    const xScale = d3.scaleBand().range([0, chartWidth]).paddingInner(0.2).paddingOuter(0.2);
    const yScale = d3.scaleLinear().range([chartHeight, 0]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${d}`); // activity

    // console.log("date:",data[0].timestamp.toDate())

    var dateHoursAndMinutes = data.map((item) => {
        const date = item.timestamp.toDate();
        return {
          hours: date.getHours(),
          minutes: date.getMinutes(),
          seconds: date.getSeconds()
        };
    });
    var combinedTime = dateHoursAndMinutes.map((item) => {
        return {
            time: item.hours + ':' + item.minutes + ':' + item.seconds
        }
    });

    // Set the x labels to human readable times from firebase
    xAxis.tickFormat((value, index) => {
        // Get the corresponding combinedTime value for the tick index
        const time = combinedTime[index].time;
        return time;
    });
    

    xScale.domain(data.map((item) => item.timestamp));
    yScale.domain([0, d3.max(data, (d) => d.dog)]);

    const rects = chart.selectAll('rect').data(data);

    rects.exit().remove();

    rects
      .attr('width', xScale.bandwidth)
      .attr('height', (d) => chartHeight - yScale(d.dog))
      .attr('x', (d) => xScale(d.timestamp))
      .attr('y', (d) => yScale(d.dog))
      .style('fill', 'purple');

    rects
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.timestamp))
      .attr('y', (d) => yScale(d.dog))
      .attr('width', xScale.bandwidth)
      .transition()
      .duration(1000)
      .attr('height', (d) => chartHeight - yScale(d.dog))
      .style('fill', 'purple');

    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    xAxisGroup
      .selectAll('text')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-40)')
      .attr('fill', 'purple')
      .attr('font-size', '0.5rem');

    yAxisGroup
      .selectAll('text')
      .attr('text-anchor', 'end')
      .attr('fill', 'purple')
      .attr('font-size', '0.75rem');
  };

  useEffect(() => {
    const uid = auth.currentUser.uid;
    const actRef = collection(db, 'users', `${uid}`, 'activity');
    const q = query(actRef, limit(20), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (docSnap) => {
      setData(docSnap.docs.map((doc) => doc.data()).reverse());
    });

    const svg = d3
      .select('.canvas')
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .style('border', '2px solid gray');

    const chart = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
    chart.append('g').attr('class', 'x-axis').attr('transform', `translate(0, ${chartHeight})`);
    chart.append('g').attr('class', 'y-axis');

    return () => {
      svg.remove();
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      updateChart(data);
    }
  }, [data]);

  return <div className="canvas"></div>;
}
