import * as d3 from 'd3';
import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, where, getDocs, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

// Based on AreaAllActivityChart.js but for entire day

export function DailyActivityChart() {
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

    const legendLabels = ['Person', 'Dog', 'Cat'];
    const xAxisLabel = 'Time';
    const yAxisLabel = 'Activity';


    svg
      .append('text')
      .attr('class', 'chart-title')
      .attr('x', svgWidth / 2)
      .attr('y', margin.top + 6)
      .attr('text-anchor', 'middle')
      .attr('font-size','28px')
      .text('Daily Activity');

    const legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${svgWidth - (4*margin.right)}, ${margin.top})`);

    const legendItems = legend.selectAll('.legend-item')
      .data(legendLabels)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItems
      .append('rect')
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', (d, i) => ['purple', 'green', 'blue'][i])
      .attr('opacity', 0.5);

    legendItems
      .append('text')
      .attr('x', 15)
      .attr('y', 8)
      .attr('font-size', '16px')
      .text(d => d);

    // X-axis label
    svg
    .append('text')
    .attr('class', 'x-axis-label')
    .attr('x', svgWidth / 2)
    .attr('y', svgHeight - 2)
    .attr('text-anchor', 'middle')
    .attr('font-size','12px')
    .text(xAxisLabel);

    // Y-axis label
    svg
    .append('text')
    .attr('class', 'y-axis-label')
    .attr('x', -svgHeight / 2)
    .attr('y', margin.left / 2)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text(yAxisLabel);

    const areaPerson = d3
      .area()
      .x((d) => xScale(d.timestamp))
      .y0(chartHeight)
      .y1((d) => yScale(d.person));

    const areaDog = d3
      .area()
      .x((d) => xScale(d.timestamp))
      .y0(chartHeight)
      .y1((d) => yScale(d.dog));

    const areaCat = d3
      .area()
      .x((d) => xScale(d.timestamp))
      .y0(chartHeight)
      .y1((d) => yScale(d.cat));

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${d}`);

    var dateHoursAndMinutes = data.map((item) => {
      const date = item.timestamp.toDate();
      return {
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
      };
    });
    var combinedTime = dateHoursAndMinutes.map((item) => {
      return {
        time: item.hours + ':' + item.minutes + ':' + item.seconds,
      };
    });

    // Set the x labels to human readable times from firebase
    xAxis.tickFormat((value, index) => {
      // Get the corresponding combinedTime value for the tick index
      const time = combinedTime[index].time;
      return time;
    });

    xScale.domain(data.map((item) => item.timestamp));
    yScale.domain([
      0,
      d3.max(data, (d) => Math.max(d.person, d.dog, d.cat)), // Adjust domain to include all three data values
    ]);

    const areaPersonPath = chart.selectAll('.area-person').data([data]);
    const areaDogPath = chart.selectAll('.area-dog').data([data]);
    const areaCatPath = chart.selectAll('.area-cat').data([data]);

    areaPersonPath.exit().remove();
    areaDogPath.exit().remove();
    areaCatPath.exit().remove();

    areaPersonPath
      .attr('d', areaPerson)
      .attr('fill', 'purple')
      .attr('opacity', 0.5);

    areaDogPath
      .attr('d', areaDog)
      .attr('fill', 'green')
      .attr('opacity', 0.5);

    areaCatPath
      .attr('d', areaCat)
      .attr('fill', 'blue')
      .attr('opacity', 0.5);

    areaPersonPath
      .enter()
      .append('path')
      .attr('class', 'area-person')
      .attr('d', areaPerson)
      .attr('fill', 'purple')
      .attr('opacity', 0.5);

    areaDogPath
      .enter()
      .append('path')
      .attr('class', 'area-dog')
      .attr('d', areaDog)
      .attr('fill', 'green')
      .attr('opacity', 0.5);

    areaCatPath
      .enter()
      .append('path')
      .attr('class', 'area-cat')
      .attr('d', areaCat)
      .attr('fill', 'blue')
      .attr('opacity', 0.5);

    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    xAxisGroup
      .selectAll('text')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-40)')
      .attr('fill', 'black')
      .attr('font-size', '0.5rem');

    yAxisGroup
      .selectAll('text')
      .attr('text-anchor', 'end')
      .attr('fill', 'black')
      .attr('font-size', '0.75rem');
  };

  useEffect(() => {

    // Start of copy
    const uid = auth.currentUser.uid;
    const actRef = collection(db, 'users', `${uid}`, 'activity');

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfDay_timestamp = Timestamp.fromDate(startOfDay)

    console.log("start of day: ",startOfDay_timestamp)
    const q = query(
      actRef,
      where('timestamp', '>=', startOfDay_timestamp),
      limit(10000),
      orderBy('timestamp', 'desc')
    );

    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(q);
        setData(querySnapshot.docs.map((doc) => doc.data()).reverse());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    // if no cache data
    // large fetch -> fetchData()
    // else nothing (logic in subscriber)
    // subscriber (new data add onto local storage, viz only local storage)
    // See ActivityRechart.js for local storage logic)


    // Optionally, you may want to subscribe to changes using onSnapshot
    // end copy
    // const unsubscribe = onSnapshot(q, (docSnap) => {
    //   if (!docSnap.metadata.hasPendingWrites) {
    //     setData(docSnap.docs.map((doc) => doc.data()).reverse());
    //   }
    // });

    const svg = d3
      .select('.canvas')
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .style('border', '1px solid gray');

    const chart = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
    chart.append('g').attr('class', 'x-axis').attr('transform', `translate(0, ${chartHeight})`);
    chart.append('g').attr('class', 'y-axis');

    return () => {
      svg.remove();
      // unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      updateChart(data);
    }
  }, [data]);

  return <div className="canvas"></div>;
}
