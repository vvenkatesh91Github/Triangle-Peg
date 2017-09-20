var movesTaken = 0;
var movesAvailable = [];

$(document).ready(function()
{
	$("body").css(
	{
		width : $(window).width(),
		height : $(window).height(),
	});
	var canvas = document.getElementById("myCanvas");
	var context = canvas.getContext("2d");
	context.beginPath();
	var canvasWidth = 500;
	var canvasHeight = 500;
	context.moveTo(canvasWidth/2, 0);
	context.lineTo(0, canvasHeight);
	context.lineTo(canvasWidth, canvasHeight);
	context.closePath();
	context.fillStyle = "#b1bf85";
	context.fill();
	
	var openPosition = undefined;
	$("#play").click(function()
	{
		var canStartGame = false;
		$(".openPeg").each(function(i, e)
		{
			if($(this).css("display").indexOf("block") >= 0)
			{
				canStartGame = true;
				return;
			}
		});
		if(canStartGame)
		{
			$(".openPegParent").hide();
			$(".controlButtons").toggle();
			$(".peg").unbind("click");
			startGame();
		}
		else
			alert("Please choose a peg to open and click play.");
	});
	
	$("#reset").click(function()
	{
		$(".openPegParent").show();
		$(".controlButtons").toggle();
		$(".openPeg").hide();;
		$(".peg").show();
		$("div[pegid='"+openPosition+"']").toggle();
		movesTaken = 0;
		$("#totalMoves").text("Moves: " + movesTaken);
	});
	
	$("input[name='openPeg']").change(function()
	{
		var type = $(this).val();
		if(type == "random")
			openRandomPeg();
		else if(type == "manual")
		{
			$(".openPeg").hide();;
			$(".peg").show();
			$(".peg").click(function()
			{
				$(".openPeg").hide();;
				$(".peg").show();
				$(this).parent().children().toggle();
				openPosition = $(this).attr("pegid");
			});
			alert("Please choose a peg to open.");
		}
	});
	
	openRandomPeg();
});

function openRandomPeg()
{
	$(".openPeg").hide();;
	$(".peg").show();
	var arr = $(".peg");
	var random = Math.floor(Math.random() * arr.length);
	var peg = arr[random];
	$(peg).parent().children().toggle();
	openPosition = $(peg).attr("pegid");
}

function startGame()
{
	$("#hint").unbind("click").bind("click", function()
	{
		findChances(true);
	});
	
	alert("Drag and Drop pegs to play");
	var possiblePositions = [];
	enableDraggable();
	
	function findMoves(draggedPeg)
	{
		var peg = $("div.peg[pegid='"+draggedPeg+"']");
		var arr = draggedPeg.split("").map(Number);
		var row = arr[0];
		var column = arr[1];
		var moves = [];
		moves = moves.concat(findPositions(row-2, [-2, 0]));
		moves = moves.concat(findPositions(row, [-2, 2]));
		moves = moves.concat(findPositions(row+2, [0, 2]));
		
		if(moves.length <= 0)
			console.log("No moves found");
		return moves;
		
		function findPositions(trow, possibleLocations)
		{
			var temp = [];
			for(var i = 0; i < possibleLocations.length; i++)
			{
				var index = trow + "" + (column + possibleLocations[i]);
				if(index != draggedPeg)
				{
					if($("div.peg[pegid='" + index + "']").length > 0)
					{
						if($("div.peg[pegid='" + index + "']").css("display") == "none")
							temp.push(index);
					}
				}
			}
			return temp;
		}
	}
	
	function enableDraggable()
	{
		$(".peg").draggable(
		{
			revert:true,
			start: function(event, ui)
			{
				possiblePositions = findMoves($(event.target).attr("pegid"));
				enableDroppable();
			},
		});
	}
	
	function enableDroppable()
	{
		if(possiblePositions.length > 0)
		{
			for(var i = 0; i < possiblePositions.length; i++)
			{
				$("div.peg[pegid='" + possiblePositions[i] + "']").parent().droppable(
				{
					drop: function(event, ui)
					{
						var source = $(ui.draggable[0]).attr("pegid");
						var destination = $(event.target).eq(0).children(".peg").attr("pegid");
						
						$(ui.draggable[0]).parent().children(".peg").hide();
						$(ui.draggable[0]).parent().children(".openPeg").show();
						
						$(event.target).children().toggle();
						
						hideJumpee(source.split("").map(Number), destination.split("").map(Number));
						$(".circleContainer.ui-droppable").removeClass("ui-droppable");
						
						if(findChances().length == 0)
						{
							if(!isGameEnd())
								alert("No possible moves found. Try to rearrange the pegs.");
						}
					}
				});
			}
		}
	}
	
	function isGameEnd()
	{
		var isEnd = false;
		var count = 0;
		$(".peg").each(function()
		{
			if($(this).css("display").indexOf("block") >= 0)
				count++;
		});
		if(count == 1)
		{
			isEnd = true;
			var previousMoves = localStorage.getItem("previousBest");
			if(previousMoves == undefined || previousMoves == null)
				previousMoves = 0;
			else
				previousMovesparseInt(previousMoves);
			
			alert("You made it!! Moves made : "+movesTaken+". Try to complete it in less number of moves.")
			movesTaken = 0;
			$("#totalMoves").text("Moves: 0");
			$(".openPegParent").show();
			$(".controlButtons").toggle();
			$(".openPeg").hide();
			$(".peg").show();
			openPosition = undefined;
			
			if($("input[name='openPeg']").val() == "random")
				openRandomPeg();
		}
		return isEnd;
	}

	function hideJumpee(source, destination)
	{
		var sourceRow = source[0];
		var sourceColumn = source[1];
		var destinationRow = destination[0];
		var destinationColumn = destination[1];
		var jumpee = "";
		var canProceed = false;
		if(destinationRow == (sourceRow - 2))
		{
			if(destinationColumn == (sourceColumn - 2))
			{
				jumpee = ((sourceRow - 1) + "" + (sourceColumn - 1));
				canProceed = true;
			}
			
			else if(destinationColumn == sourceColumn)
			{
				jumpee = ((sourceRow - 1) + "" + sourceColumn);
				canProceed = true;
			}
		}
		else if(destinationRow == sourceRow)
		{
			if(destinationColumn == (sourceColumn - 2))
			{
				jumpee = (sourceRow + "" + (sourceColumn - 1));
				canProceed = true;
			}
			else if(destinationColumn == (sourceColumn + 2))
			{
				jumpee = (sourceRow + "" + (sourceColumn + 1));
				canProceed = true;
			}
		}
		else if(destinationRow == (sourceRow + 2))
		{
			if(destinationColumn == sourceColumn)
			{
				jumpee = ((sourceRow + 1) + "" + sourceColumn);
				canProceed = true;
			}
			else if(destinationColumn == (sourceColumn + 2))
			{
				jumpee = ((sourceRow + 1) + "" + (sourceColumn + 1));
				canProceed = true;
			}
		}
		movesTaken++;
		$("#totalMoves").text("Moves: " + movesTaken);
		if(canProceed)
		{
			$("div.peg[pegid='" + jumpee + "']").parent().children(".peg").hide();
			$("div.peg[pegid='" + jumpee + "']").parent().children(".openPeg").show();
		}
	}
	
	function findChances(highlight)
	{
		var openAreas = [];
		$(".peg").each(function(i, e)
		{
			if($(e).css("display").indexOf("none") >= 0)
				openAreas.push(e);
		});
		
		var pegRow = undefined;
		var pegColumn = undefined;
		movesAvailable = [];
		for(var i = 0; i < openAreas.length; i++)
		{
			var pegIdArr = $(openAreas[i]).attr("pegid").split("").map(Number);
			pegRow = pegIdArr[0];
			pegColumn = pegIdArr[1];
			
			traverseUpward();
			traverseSameRow();
			traverseDownward();
		}

		function traverseUpward()
		{
			return traverse([((pegRow - 1) + "" + (pegColumn - 1)), ((pegRow - 2) + "" + (pegColumn - 2))], [((pegRow - 1) + "" + pegColumn), ((pegRow - 2) + "" + pegColumn)]);
		}
		
		function traverseSameRow()
		{
			return traverse([(pegRow + "" + (pegColumn - 1)), (pegRow + "" + (pegColumn - 2))], [(pegRow + "" + (pegColumn + 1)), (pegRow + "" + (pegColumn + 2))]);
		}
		
		function traverseDownward()
		{
			return traverse([((pegRow + 1) + "" + pegColumn), ((pegRow + 2) + "" + pegColumn)], [((pegRow + 1) + "" + (pegColumn + 1)), ((pegRow + 2) + "" + (pegColumn + 2))]);
		}
		
		function traverse(set1, set2)
		{
			var isPossible = false;
			var left1 = "div.peg[pegid='" + set1[0] + "']";
			var left2 = "div.peg[pegid='" + set1[1] + "']";
			var right1 = "div.peg[pegid='" + set2[0] + "']";
			var right2 = "div.peg[pegid='" + set2[1] + "']";
			
			if($(left1).length > 0 && $(left2).length > 0)
			{
				if($(left1).css("display").indexOf("block") >= 0 && $(left2).css("display").indexOf("block") >= 0)
				{
					movesAvailable.push([$(left1), $(left2)]);
					isPossible = true;
				}
			}
			if($(right1).length > 0 && $(right2).length > 0)
			{
				if($(right1).css("display").indexOf("block") >= 0 && $(right2).css("display").indexOf("block") >= 0)
				{
					movesAvailable.push([$(right1), $(right2)]);
					isPossible = true;
				}
			}
			return isPossible;
		}
		
		if(highlight)
		{
			var random = Math.floor(Math.random() * movesAvailable.length);
			var set = movesAvailable[random];
			$(set[0]).addClass("blink");
			$(set[1]).addClass("blink");
			setTimeout(function()
			{
				$(set[0]).removeClass("blink");
				$(set[1]).removeClass("blink");
			}, 1000);
		}
		
		return movesAvailable;
	}
}