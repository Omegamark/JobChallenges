# maxHigh=0
# highTotal=0
# highCount=0
# for f in crashing/high*.ts
# do
#   segBandwidth=$(ffprobe $f 2>&1 | grep bitrate | cut -f8 -d " ")
#   highTotal=$((highTotal + segBandwidth))
#   highCount=$((highCount + 1))
#   if (($segBandwidth > $maxHigh)); then
#     maxHigh=$segBandwidth
#   fi
# done

# echo "BANDWIDTH for 'high':" $((maxHigh * 1000))
# highAverage=$((highTotal / highCount))
# echo "AVERAGE-BANDWIDTH for 'high':" $((highAverage * 1000))

# echo

maxMed=0
medTotal=0
medCount=0
for f in ./test_1080/output*.ts
do
  segBandwidth=$(ffprobe $f 2>&1 | grep bitrate | cut -f8 -d " ")
  medTotal=$((medTotal + segBandwidth))
  medCount=$((medCount + 1))
  if (($segBandwidth > $maxMed)); then
    maxMed=$segBandwidth
  fi
done

echo "BANDWIDTH for 'med':" $((maxMed * 1000))
medAverage=$((medTotal / medCount))
echo "AVERAGE-BANDWIDTH for 'med':" $((medAverage * 1000))


# echo

# maxLow=0
# lowTotal=0
# lowCount=0
# for f in crashing/low*.ts
# do
#   segBandwidth=$(ffprobe $f 2>&1 | grep bitrate | cut -f8 -d " ")
#   lowTotal=$((lowTotal + segBandwidth))
#   lowCount=$((lowCount + 1))
#   if (($segBandwidth > $maxLow)); then
#     maxLow=$segBandwidth
#   fi
# done

# echo "BANDWIDTH for 'low':" $((maxLow * 1000))
# lowAverage=$((lowTotal / lowCount))
# echo "AVERAGE-BANDWIDTH for 'low':" $((lowAverage * 1000))